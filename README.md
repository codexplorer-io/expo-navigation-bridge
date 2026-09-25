# `@codexporer.io/expo-navigation-bridge`

A lightweight, zero-dependency bridge library designed to decouple reusable UI components, libraries, and design-system modules from specific navigation implementations (such as `@react-navigation/native`, `@react-navigation/stack`, or Expo Router).

## Why Use Navigation Bridge?

Reusable packages (e.g. `@codexporer.io/expo-picker`) often need to:
- Trigger navigation actions (`push`, `navigate`, `goBack`).
- Apply screen transition animations (e.g. modal slide from bottom).
- Detect screen focus to attach/detach hardware back handlers or trigger effects (`useIsFocused`).

Directly importing `@react-navigation/*` packages inside shared libraries tightly couples them to specific versions and makes standalone usage or alternative routers difficult. `@codexporer.io/expo-navigation-bridge` solves this by providing a unified injection layer: the host application registers its navigation instance, transitions, and hooks once, and shared libraries consume them via a clean, abstract API.

## Installation & Peer Dependencies

```bash
yarn add @codexporer.io/expo-navigation-bridge
```

This package has **zero runtime dependencies** and no mandatory peer dependencies.

## API Reference

### 1. Navigation Controller

#### Types & Interfaces

```typescript
export interface Navigation {
  goBack: () => void;
  push: (name: string, params?: Record<string, any>) => void;
  navigate: (name: string, params?: Record<string, any>) => void;
}
```

#### Methods

- **`setNavigation(nav: Navigation): void`**: Registers the active navigation controller instance (typically from `navigationRef.current` or `useNavigation()`).
- **`getNavigation(): Navigation | null`**: Returns the registered navigation controller, or `null` if not set.

---

### 2. Screen Transitions

#### Types & Interfaces

```typescript
export interface ScreenTransitions {
  slideFromBottom?: Record<string, any>;
  slideFromRight?: Record<string, any>;
}
```

#### Methods

- **`setScreenTransitions(transitions: ScreenTransitions): void`**: Registers screen transition presets (e.g. `TransitionPresets.ModalSlideFromBottomIOS` from `@react-navigation/stack`).
- **`getScreenTransitions(): ScreenTransitions | null`**: Returns the registered screen transitions object, or `null` if not set.

---

### 3. Focus Hook

#### Types & Interfaces

```typescript
export type UseIsFocused = () => boolean;
```

#### Functions & Hooks

- **`setUseIsFocused(hook: UseIsFocused): void`**: Registers the `useIsFocused` hook implementation (e.g. `useIsFocused` from `@react-navigation/native`).
- **`getUseIsFocused(): UseIsFocused`**: Returns the registered hook function.
- **`useIsFocused(): boolean`**: React custom hook that delegates to the registered hook. Defaults safely to `() => true` if no hook has been registered (ideal for standalone usage or tests).

---

## Quick Start & Usage

### 1. In the Host Application (Setup)

Configure the bridge once at your application's root or navigation setup:

```tsx
import React, { useRef, useEffect } from 'react';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import {
  setNavigation,
  setScreenTransitions,
  setUseIsFocused
} from '@codexporer.io/expo-navigation-bridge';
import { getRouteConfig } from '@codexporer.io/expo-picker';

// 1. Register screen transitions
setScreenTransitions({
  slideFromBottom: TransitionPresets.ModalSlideFromBottomIOS,
  slideFromRight: TransitionPresets.SlideFromRightIOS
});

// 2. Register navigation hooks
setUseIsFocused(useIsFocused);

const Stack = createStackNavigator();
const [pickerRoute] = getRouteConfig();

export function RootNavigator() {
  const navigationRef = useRef(null);

  useEffect(() => {
    // 3. Register navigation controller ref
    if (navigationRef.current) {
      setNavigation(navigationRef.current);
    }
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        {/* Application screens */}
        <Stack.Screen
          name={pickerRoute.name}
          component={pickerRoute.screen}
          options={pickerRoute.screenOptions}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

### 2. In Reusable Components & Libraries

#### Performing Navigation Actions

```tsx
import { getNavigation } from '@codexporer.io/expo-navigation-bridge';

export function closeScreen() {
  getNavigation()?.goBack();
}

export function openDetails(id: string) {
  getNavigation()?.navigate('Details', { id });
}
```

#### Applying Screen Transitions

```tsx
import { getScreenTransitions } from '@codexporer.io/expo-navigation-bridge';

export const routeConfig = {
  name: 'ModalScreen',
  component: ModalScreenComponent,
  screenOptions: {
    ...(getScreenTransitions()?.slideFromBottom ?? {})
  }
};
```

#### Using Focus State in React Components

```tsx
import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useIsFocused } from '@codexporer.io/expo-navigation-bridge';

export const MyComponent: React.FC = () => {
  const isFocused = useIsFocused();

  useEffect(() => {
    const handler = isFocused && BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // Handle back press
        return true;
      }
    );

    return () => {
      handler && handler.remove();
    };
  }, [isFocused]);

  return null;
};
```

## License

MIT