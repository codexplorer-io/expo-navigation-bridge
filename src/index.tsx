export interface Navigation {
    goBack: () => void;
    push: (name: string, params?: Record<string, any>) => void;
    navigate: (name: string, params?: Record<string, any>) => void;
}

export interface ScreenTransitions {
    slideFromBottom?: Record<string, any>;
    slideFromRight?: Record<string, any>;
}

export type UseIsFocused = () => boolean;

let navigation: Navigation | null = null;
let screenTransitions: ScreenTransitions | null = null;
let isFocusedHook: UseIsFocused = () => true;

export const setNavigation = (nav: Navigation): void => {
    navigation = nav;
};

export const getNavigation = (): Navigation | null => {
    return navigation;
};

export const setScreenTransitions = (transitions: ScreenTransitions): void => {
    screenTransitions = transitions;
};

export const getScreenTransitions = (): ScreenTransitions | null => {
    return screenTransitions;
};

export const setUseIsFocused = (hook: UseIsFocused): void => {
    isFocusedHook = hook;
};

export const getUseIsFocused = (): UseIsFocused => {
    return isFocusedHook;
};

export const useIsFocused: UseIsFocused = () => {
    return isFocusedHook();
};
