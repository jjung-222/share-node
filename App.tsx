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
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

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
            <ReloadInstructions />
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
    </SafeAreaView>
  );
}

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
});

export default App;
