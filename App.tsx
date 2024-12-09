import React, { useState, useEffect, useRef } from 'react';
import type { PropsWithChildren } from 'react';
import { GoogleSignin, GoogleSigninButton, statusCodes, SignInSuccessResponse, CancelledResponse } from '@react-native-google-signin/google-signin';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Alert,
  Button,
  TouchableOpacity,
  Image,
} from 'react-native';
import { WebView } from "react-native-webview";

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import NaverLogin, {
  NaverLoginResponse,
  GetProfileResponse,
} from '@react-native-seoul/naver-login';

import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import { enableScreens } from 'react-native-screens';

import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();



// 네이버 API 키 값 설정
const consumerKey = 'gu756P_YZBUNtqaqwohM'; // 네이버에서 발급받은 consumerKey
const consumerSecret = '8GeElHUit2'; // 네이버에서 발급받은 consumerSecret
const appName = 'shareNode';
const serviceUrlSchemeIOS = 'com.shareNode'; // 네이버 개발자 센터에서 설정한 URL Scheme

const naverLogin = require('./src/imgs/NaverLogin/loginSimple.png'); // 네이버 로고 이미지 경로
const naverLogout = require('./src/imgs/NaverLogin/logoutShort.png'); // 네이버 로고 이미지 경로

const WEB_CLIENT_ID = '249896429943-u2m4akbsrhuhhfp7h68479lk9fbdqe2c.apps.googleusercontent.com'; // 자신의 웹 클라이언트 ID로 변경

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({ children, title }: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

enableScreens();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    configureGoogleSign();
  }, []);

  function configureGoogleSign() {
    GoogleSignin.configure({
      webClientId: '249896429943-u2m4akbsrhuhhfp7h68479lk9fbdqe2c.apps.googleusercontent.com', // 웹 클라이언트 ID
      iosClientId: '249896429943-ca8uo23ulj1q6acgktre3nnu59r9jq3i.apps.googleusercontent.com', // iOS 클라이언트 ID
      offlineAccess: false,
    });
  }

  const webviewRef = useRef(null);


  const [userInfo, setUserInfo] = useState<SignInSuccessResponse | CancelledResponse | null>(null);  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(null);

  //naver
  const [success, setSuccessResponse] = useState<NaverLoginResponse['successResponse']>();
  const [failure, setFailureResponse] = useState<NaverLoginResponse['failureResponse']>();
  const [getProfileRes, setGetProfileRes] = useState<GetProfileResponse>();

  useEffect(() => {
    NaverLogin.initialize({
      appName,
      consumerKey,
      consumerSecret,
      serviceUrlSchemeIOS,
    });
  }, []);

  // 네이버 로그인 함수
  const login = async () => {
    try {
      // NaverLogin.login() 메서드를 인수 없이 호출
      const response: NaverLoginResponse = await NaverLogin.login();
  
      // 응답의 isSuccess 속성으로 로그인 결과 처리
      if (response.isSuccess) {
        setSuccessResponse(response.successResponse); // 성공한 경우 successResponse를 사용
        setFailureResponse(undefined);
        await callLoginAPI(response.successResponse && response.successResponse.accessToken);
      } else {
        setFailureResponse(response.failureResponse); // 실패한 경우 failureResponse를 사용
        setSuccessResponse(undefined);
      }
    } catch (error) {
      console.error("Login error:", error); // 에러 로깅
    }
  };
  
  


  // 네이버 로그아웃 함수
  const logout = async () => {
    try {
      await NaverLogin.logout();
      setSuccessResponse(undefined);
      setFailureResponse(undefined);
      setGetProfileRes(undefined);
    } catch (e) {
      console.error(e);
    }
  };

  // 프로필 가져오기 함수
  const getProfile = async () => {
    if (!success || !success.accessToken) {
      console.error('No access token available');
      return;
    }

    try {
      const profileResult = await NaverLogin.getProfile(success.accessToken);
      setGetProfileRes(profileResult);
    } catch (e) {
      console.error('Failed to get profile:', e);
      setGetProfileRes(undefined);
    }
  };

  // 토큰 삭제 함수
  const deleteToken = async () => {
    try {
      await NaverLogin.deleteToken();
      setSuccessResponse(undefined);
      setFailureResponse(undefined);
      setGetProfileRes(undefined);
    } catch (e) {
      console.error(e);
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      setIsLoggedIn(false);
    } catch (error) {
      Alert.alert('Something else went wrong... ', error.toString());
    }
  };

  const LogInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
  
      if (response.type === 'success') {
        const userInfoResponse: SignInSuccessResponse = response;
        setUserInfo(userInfoResponse);
        setIsLoggedIn(true);
        setError(null);
      } else if (response.type === 'cancelled') {
        const cancelledResponse: CancelledResponse = response;
        setUserInfo(cancelledResponse);
        Alert.alert('Process Cancelled');
      }
    } catch (error: any) { // error 타입을 any로 지정
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Play services are not available");
      } else {
        Alert.alert('Something else went wrong... ', error.toString());
        setError(error);
      }
    }
  };

  const postMessage = () => {
    console.log("postMessage")
  };
  
  const CalenderScreen = () => {
    return (
      <WebView
    ref={webviewRef}
    source={{ uri: 'http://sharenode.shop' }}
    onLoad={postMessage}
    onError={(syntheticEvent) => {
      const { nativeEvent } = syntheticEvent;
      console.error('WebView error: ', nativeEvent);
    }}
  />
    );
  }
  
  const BlogScreen = () => {
    return (
      <View>
        <Text>Blog</Text>
      </View>
    );
  }
  
  const MyPageScreen = () => {
    return (
      <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={backgroundStyle}>
          {/* <Header /> */}
          <View
            style={{
              backgroundColor: isDarkMode ? Colors.black : Colors.white,
            }}>
            <Section title="구글로그인">
              <GoogleSigninButton
                style={styles.signInButton}
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={() => LogInWithGoogle()}
              />
              <View style={styles.status}>
                {isLoggedIn === false ? (
                  <Text style={styles.loggedinMessage}>You must sign in!</Text>
                ) : (
                  <Button onPress={() => signOut()} title='Sign out' color='#332211' />
                )}
              </View>
            </Section>
            <Section title="네이버로그인">
              <TouchableOpacity style={styles.naverLoginButton} onPress={success ? logout : login}>
                <Image source={success ? naverLogout : naverLogin} style={styles.naverLogo} />
              </TouchableOpacity>
              <Gap />
              {success ? (
                <>
                  <Button title="Get Profile" onPress={getProfile} />
                  <Gap />
                  <Button title="Delete Token" onPress={deleteToken} />
                  <Gap />
                  <ResponseJsonText name={'Success'} json={success} />
                </>
              ) : null}
              {failure ? <ResponseJsonText name={'Failure'} json={failure} /> : null}
              {getProfileRes ? <ResponseJsonText name={'GetProfile'} json={getProfileRes} /> : null}
            </Section>
          </View>
        </ScrollView>
        
    );
  }
  
  const MessageScreen = () => {
    return (
      <View>
        <Text>Message</Text>
      </View>
    );
  }

  //로그인 api 추가
  const callLoginAPI = async (accessToken) => { 
    let profile;
    try {
      profile = await NaverLogin.getProfile(accessToken);
      setGetProfileRes(profile);
    } catch (e) {
      console.error('Failed to get profile:', e);
      setGetProfileRes(undefined);
    }

    try {
      const response = await fetch('https://api.sharenode.shop/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}` // 필요하면 Authorization 헤더 사용
        },
        body: JSON.stringify({
          userId: profile && profile.response.id,
          email: profile && profile.response.email,
          provider: "naver",
          token: accessToken, // API에서 요구하는 데이터 형태에 맞춤
        }),
      });
  
      if (!response.ok) {
        const errorResponse = await response.text(); // JSON이면 .json()으로 처리
      console.error('서버 에러 내용:', errorResponse);
        throw new Error(`API 호출 실패: ${response.status}`);
      }
  
      const result = await response.json();
      console.log('로그인 API 결과:', result);
  
      // 결과에 따라 다음 작업 수행
      // 예: result.token 저장, 사용자 프로필 업데이트 등
    } catch (error) {
      console.error('API 호출 중 오류 발생:', error.message);
    }
  };

  return (
    <NavigationContainer>
      <Tab.Navigator initialRouteName="Calender" screenOptions={{ tabBarStyle: styles.tabBarStyle }}>
        <Tab.Screen
          name="Calender"
          component={CalenderScreen}
          options={{
            title: '',
            tabBarIcon: ({ color, size }) => (
              <View style={styles.iconContainer}>
                <Icon name="event" color={color} size={size} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Blog"
          component={BlogScreen}
          options={{
            title: '',
            tabBarIcon: ({ color, size }) => (
              <View style={styles.iconContainer}>
                <Icon name="article" color={color} size={size} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Home"
          component={MessageScreen}
          options={{
            title: '',
            tabBarIcon: ({ color, size }) => (
              <View style={styles.iconContainer}>
                <Icon name="home" color={color} size={size} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Message"
          component={MessageScreen}
          options={{
            title: '',
            tabBarIcon: ({ color, size }) => (
              <View style={styles.iconContainer}>
                <Icon name="message" color={color} size={size} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="MyPage"
          component={MyPageScreen}
          options={{
            title: '',
            tabBarIcon: ({ color, size }) => (
              <View style={styles.iconContainer}>
                <Icon name="account-circle" color={color} size={size} />
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    
    </NavigationContainer>
  );  
}

// 간격을 위한 컴포넌트
const Gap = () => <View style={{marginTop: 24}} />;

// JSON 데이터를 출력하는 컴포넌트
const ResponseJsonText = ({json = {}, name}: {json?: object; name: string}) => (
  <View style={{padding: 12, borderRadius: 16, borderWidth: 1, backgroundColor: '#242c3d'}}>
    <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>{name}</Text>
    <Text style={{color: 'white', fontSize: 13, lineHeight: 20}}>
      {JSON.stringify(json, null, 4)}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 10,
    marginBottom: 60,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  signInButton: {
    width: 200,
    height: 50,
  },
  status: { 
    marginTop: 20,
    alignItems: 'center',
  },
  loggedinMessage: { 
    fontSize: 16,
    color: 'red', 
    marginTop: 10,
  },
  naverLoginButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  naverLogo: {
    width: 200,  // 로고의 너비
    height: 50,  // 로고의 높이
  },
  tabBarStyle: {
    position: 'absolute',
    height: 60,
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0, // Android의 그림자 없애기
    backgroundColor: Colors.white, // 색상 설정
  },
  iconContainer: {
    top: 7,
    justifyContent: 'center', // 중앙 정렬
    alignItems: 'center', // 중앙 정렬
  },
});

export default App;
