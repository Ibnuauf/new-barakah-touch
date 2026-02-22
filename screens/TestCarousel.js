import React, { useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    FlatList,
    Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

const DATA = [
    "#B0604D",
    "#899F9C",
    "#B3C680",
    "#5C6265",
    "#F5D399",
];

const ITEM_WIDTH = width * 0.75;
const SPACING = 20;

export default function ParallaxCarousel() {
    const scrollX = useRef(new Animated.Value(0)).current;

    const Pagination = ({ data, scrollX }) => {
        return (
            <View style={styles.pagination}>
                {data.map((_, index) => {
                    const inputRange = [
                        (index - 1) * (ITEM_WIDTH + SPACING),
                        index * (ITEM_WIDTH + SPACING),
                        (index + 1) * (ITEM_WIDTH + SPACING),
                    ];

                    const scale = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.8, 1.4, 0.8],
                        extrapolate: "clamp",
                    });

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.4, 1, 0.4],
                        extrapolate: "clamp",
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    opacity,
                                    transform: [{ scale }],
                                },
                            ]}
                        />
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Animated.FlatList
                data={DATA}
                keyExtractor={(_, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={ITEM_WIDTH + SPACING}
                decelerationRate="fast"
                contentContainerStyle={{
                    paddingHorizontal: (width - ITEM_WIDTH) / 2,
                }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: true }
                )}
                renderItem={({ item, index }) => {
                    const inputRange = [
                        (index - 1) * (ITEM_WIDTH + SPACING),
                        index * (ITEM_WIDTH + SPACING),
                        (index + 1) * (ITEM_WIDTH + SPACING),
                    ];

                    const scale = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.9, 1, 0.9],
                        extrapolate: "clamp",
                    });

                    const translateX = scrollX.interpolate({
                        inputRange,
                        outputRange: [50, 0, -50],
                        extrapolate: "clamp",
                    });

                    return (
                        <View style={{ width: ITEM_WIDTH, marginRight: SPACING }}>
                            <Animated.View
                                style={[
                                    styles.card,
                                    {
                                        backgroundColor: item,
                                        transform: [{ scale }, { translateX }],
                                    },
                                ]}
                            >
                                <Text style={styles.text}>{index + 1}</Text>
                            </Animated.View>
                        </View>
                    );
                }}
            />

            {/* Pagination */}
            <Pagination data={DATA} scrollX={scrollX} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 260,
        justifyContent: "center",
    },
    card: {
        height: 200,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 48,
        color: "#000",
        fontWeight: "bold",
    },
    pagination: {
        flexDirection: "row",
        alignSelf: "center",
        marginTop: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#333",
        marginHorizontal: 6,
    },
});
