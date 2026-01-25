import React, { useRef, useCallback } from 'react';
import { ScrollView, ScrollViewProps, View } from 'react-native';
import { useDrag } from '../contexts/DragContext';

interface DragScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
}

export function DragScrollView({ children, style, ...props }: DragScrollViewProps) {
  const { setScrollViewRef, setScrollViewLayout } = useDrag();
  const scrollViewRef = useRef<ScrollView>(null);
  const containerRef = useRef<View>(null);

  const handleRef = useCallback((ref: ScrollView | null) => {
    scrollViewRef.current = ref;
    setScrollViewRef(ref);
  }, [setScrollViewRef]);

  const handleLayout = useCallback(() => {
    containerRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
      setScrollViewLayout({ y, height });
    });
  }, [setScrollViewLayout]);

  return (
    <View ref={containerRef} style={style} onLayout={handleLayout}>
      <ScrollView
        ref={handleRef}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        {...props}
      >
        {children}
      </ScrollView>
    </View>
  );
}
