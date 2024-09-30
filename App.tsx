import React, { useState, useEffect } from 'react';
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

function CalenderScreen() {
  return (
    <View>
      <Text>Calender</Text>
    </View>
  );
}

function BlogScreen() {
  return (
    <View>
      <Text>Blog</Text>
    </View>
  );
}

function MyPageScreen() {
  return (
    <View>
      <Text>MyPage</Text>
    </View>
  );
}

function MessageScreen() {
  return (
    <View>
      <Text>Message</Text>
    </View>
  );
}

// 네이버 API 키 값 설정
const consumerKey = 'gu756P_YZBUNtqaqwohM'; // 네이버에서 발급받은 consumerKey
const consumerSecret = '8GeElHUit2'; // 네이버에서 발급받은 consumerSecret
const appName = 'shareNode';
const serviceUrlSchemeIOS = 'com.shareNode'; // 네이버 개발자 센터에서 설정한 URL Scheme

const naverLogo = require('./src/imgs/NaverLogin/loginFull.png'); // 네이버 로고 이미지 경로

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
  
      console.log('Login response:', response); // 응답 구조 확인
  
      // 응답의 isSuccess 속성으로 로그인 결과 처리
      if (response.isSuccess) {
        setSuccessResponse(response.successResponse); // 성공한 경우 successResponse를 사용
        setFailureResponse(undefined);
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
  

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Step One">
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
          <Section title="See Your Changes">
            <TouchableOpacity style={styles.naverLoginButton} onPress={login}>
              <Image source={naverLogo} style={styles.naverLogo} />
            </TouchableOpacity>
            <Gap />
            <Button title={'Logout'} onPress={logout} />
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
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
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
    </SafeAreaView>
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
    marginTop: 32,
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
    left: 10,
    justifyContent: 'center', // 중앙 정렬
    alignItems: 'center', // 중앙 정렬
  },
});

export default App;
