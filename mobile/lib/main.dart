import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize secure storage and other platform-specifics
  
  runApp(
    const ProviderScope(
      child: EnterpriseLegalApp(),
    ),
  );
}

class EnterpriseLegalApp extends ConsumerWidget {
  const EnterpriseLegalApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Listen to routing state (auth status) to determine initial route
    // The UI must never fake authentication. Token checks happen via Dio interceptors.

    return MaterialApp.router(
      title: 'Enterprise Legal Mobile',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue.shade900),
        useMaterial3: true,
      ),
      // RTL Support Native
      builder: (context, child) {
        return Directionality(
          textDirection: TextDirection.rtl, // Defaulting to Arabic environment for Saudi firm
          child: child!,
        );
      },
      // Router config with go_router (Deep Linking enabled)
      // routerConfig: router,
    );
  }
}
