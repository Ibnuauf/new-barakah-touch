import React, { useState, useRef } from 'react'
import {
    View,
    Text,
    Modal,
    Image,
    Pressable,
    Dimensions,
    StyleSheet,
} from 'react-native'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

const { width } = Dimensions.get('window')
const SLIDER_WIDTH = width * 0.85
const ORANGE = '#FF7A00'

export default function PromoPopup({ visible, images, checked, onCheck, onClose }) {
    const carouselRef = useRef(null)
    const [activeSlide, setActiveSlide] = useState(0)

    const renderItem = ({ item }) => (
        <Image
            source={{ uri: item }}
            style={styles.image}
            resizeMode="cover"
        />
    )

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {/* Carousel */}
                    <View style={styles.imageWrapper}>
                        <Carousel
                            ref={carouselRef}
                            data={images}
                            renderItem={renderItem}
                            sliderWidth={SLIDER_WIDTH}
                            itemWidth={SLIDER_WIDTH}
                            onSnapToItem={setActiveSlide}
                            useScrollView
                        />
                    </View>

                    {/* Pagination */}
                    <Pagination
                        dotsLength={images.length}
                        activeDotIndex={activeSlide}
                        containerStyle={{ paddingVertical: 6 }}
                        dotStyle={styles.activeDot}
                        inactiveDotStyle={styles.dot}
                        inactiveDotOpacity={0.4}
                        inactiveDotScale={0.8}
                    />

                    {/* Checkbox */}
                    <Pressable
                        style={styles.checkboxRow}
                        onPress={onCheck}
                    >
                        {
                            checked ? (
                                <FontAwesome style={{ marginRight: 8 }} name='check-square' size={20} color={ORANGE} />
                            ) : (
                                <FontAwesome style={{ marginRight: 8 }} name='square-o' size={21} color={ORANGE} />
                            )
                        }
                        <Text style={styles.checkboxText}> ไม่ต้องแสดงอีก</Text>
                    </Pressable>

                    {/* Close */}
                    <Pressable style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeText}>ปิด</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
}


const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: SLIDER_WIDTH,
        borderRadius: 20,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    imageWrapper: {
        width: '100%',
        aspectRatio: 3 / 4,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ccc',
    },
    activeDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: ORANGE,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    checked: {
        backgroundColor: ORANGE,
    },
    checkboxText: {
        fontFamily: 'Sarabun-Regular',
        color: '#333',
    },
    closeBtn: {
        backgroundColor: ORANGE,
        paddingVertical: 14,
        alignItems: 'center',
    },
    closeText: {
        color: '#fff',
        fontFamily: 'Sarabun-Medium',
    },
})
