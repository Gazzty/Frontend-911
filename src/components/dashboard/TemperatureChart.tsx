import { Box, Text, HStack, Button } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { TemperatureReading } from '../../types';

const MotionBox = motion.create(Box);

interface TemperatureChartProps {
  data: TemperatureReading[];
}

type TimeRange = 'year' | 'month' | 'week' | 'day';

const MAX_CHART_POINTS = 60;

const downsample = (data: TemperatureReading[], maxPoints: number): TemperatureReading[] => {
  if (data.length <= maxPoints) return data;
  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, i) => i % step === 0);
};

const TemperatureChart = ({ data }: TemperatureChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const formatXAxis = (timestamp: string) => {
    const date = new Date(timestamp);
    switch (timeRange) {
      case 'day':
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      case 'week':
        return `${date.getDate()}/${date.getMonth() + 1}`;
      case 'month':
        return `${date.getDate()}/${date.getMonth() + 1}`;
      case 'year':
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return months[date.getMonth()];
    }
  };

  const filterData = () => {
    const now = new Date();
    let daysToShow = 7;
    
    switch (timeRange) {
      case 'day':
        daysToShow = 1;
        break;
      case 'week':
        daysToShow = 7;
        break;
      case 'month':
        daysToShow = 30;
        break;
      case 'year':
        daysToShow = 365;
        break;
    }
    
    const cutoffDate = new Date(now.getTime() - daysToShow * 24 * 60 * 60 * 1000);
    const filtered = data.filter(d => new Date(d.timestamp) >= cutoffDate);
    return downsample(filtered, MAX_CHART_POINTS);
  };

  const timeRangeButtons: { label: string; value: TimeRange }[] = [
    { label: 'Año', value: 'year' },
    { label: 'Mes', value: 'month' },
    { label: 'Semana', value: 'week' },
    { label: 'Día', value: 'day' },
  ];

  const showDots = timeRange === 'day' || timeRange === 'week';

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.200"
      >
        <HStack justify="space-between" mb={6}>
          <Text fontSize="lg" fontWeight="600">
            Mediciones de Temperatura
          </Text>
          <HStack gap={0}>
            {timeRangeButtons.map((btn) => (
              <Button
                key={btn.value}
                size="sm"
                variant={timeRange === btn.value ? 'solid' : 'ghost'}
                onClick={() => setTimeRange(btn.value)}
                bg={timeRange === btn.value ? 'brand.orange' : 'transparent'}
                color={timeRange === btn.value ? 'white' : 'gray.500'}
                _hover={{
                  bg: timeRange === btn.value ? '#E63E00' : 'gray.100',
                }}
                borderRadius="md"
              >
                {btn.label}
              </Button>
            ))}
          </HStack>
        </HStack>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filterData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              stroke="#6B6B6B"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6B6B6B"
              style={{ fontSize: '12px' }}
              label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E8E8E8',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: any) => [`${value}°C`, 'Temperatura']}
              labelFormatter={(label: any) => {
                const date = new Date(label);
                return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
              }}
            />
            <Line
              type="monotone"
              dataKey="temperatura"
              stroke="#FF4500"
              strokeWidth={2}
              dot={showDots ? { fill: '#FF4500', r: 3 } : false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </MotionBox>
  );
};

export default TemperatureChart;