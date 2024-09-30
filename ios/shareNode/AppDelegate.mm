#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <NaverThirdPartyLogin/NaverThirdPartyLogin.h> // Naver SDK 임포트 추가

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"shareNode";
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// URL Scheme 처리 메서드 추가
- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  // URL Scheme을 확인하여 Naver 로그인 처리
  if ([url.scheme isEqualToString:@"com.shareNode"]) { // 여기에 설정한 URL Scheme을 넣습니다.
    return [[NaverThirdPartyLoginConnection getSharedInstance] application:app openURL:url options:options];
  }
  return NO; // 다른 URL Scheme인 경우에는 NO 반환
}

@end
