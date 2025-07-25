import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

type TabBarIconProps = {
    source: any;
    color: string;
    focused: boolean;
};

export function TabBarIcon({ source, color, focused }: TabBarIconProps) {
    return (
        <Image
        source={source}
        style={[
            styles.icon,
            {
            tintColor: focused ? undefined : color,
            },
        ]}
        />
    );
}

const styles = StyleSheet.create({
    icon: {
        width: 24,
        height: 24,
    },
});