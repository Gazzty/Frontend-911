import { Box, Text, HStack, Button, Spinner } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import type { TemperatureReading, Celda, TimeRange } from '../../types';

const MotionBox = motion.create(Box);

interface TemperatureChartProps {
  data: TemperatureReading[];
  celdas: Celda[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  isLoading?: boolean;
}

const COLORS = ['#FF4500', '#51CF66', '#339AF0', '#FCC419', '#F06595', '#845EF7', '#20C997', '#FF922B', '#94D82D', '#4C6EF5'];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const aggregateByBucket = (data: TemperatureReading[], bucketMinutes: number): TemperatureReading[] => {
  const bucketMs = bucketMinutes * 60 * 1000;
  const map = new Map<number, { sums: Record<string, number>; counts: Record<string, number> }>();

  data.forEach(reading => {
    const ms = new Date(reading.timestamp).getTime();
    const bucketTime = Math.floor(ms / bucketMs) * bucketMs;

    if (!map.has(bucketTime)) map.set(bucketTime, { sums: {}, counts: {} });

    const bucket = map.get(bucketTime)!;
    Object.keys(reading).forEach(k => {
      if (k === 'timestamp') return;
      const val = reading[k] as number;
      if (typeof val !== 'number' || isNaN(val)) return;
      bucket.sums[k] = (bucket.sums[k] ?? 0) + val;
      bucket.counts[k] = (bucket.counts[k] ?? 0) + 1;
    });
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([ts, { sums, counts }]) => {
      const result: TemperatureReading = { timestamp: new Date(ts).toISOString(), time: ts };
      Object.keys(sums).forEach(k => { result[k] = Math.round(sums[k] / counts[k]); });
      return result;
    });
};

const TemperatureChart = ({ data, celdas, timeRange, onTimeRangeChange, isLoading = false }: TemperatureChartProps) => {
  const now = new Date();

  const filterData = () => {
    let bucketMinutes = 60;
    switch (timeRange) {
      case 'day':   bucketMinutes = 5;    break;
      case 'week':  bucketMinutes = 60;   break;
      case 'month': bucketMinutes = 360;  break;
      case 'year':  bucketMinutes = 1440; break;
    }
    return aggregateByBucket(data, bucketMinutes);
  };

  const getDomain = (): [number, number] => {
    switch (timeRange) {
      case 'day': {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        return [start.getTime(), start.getTime() + 24 * 3600 * 1000];
      }
      case 'week': {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
        const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
        return [start.getTime(), end.getTime()];
      }
      case 'month': {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
        const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
        return [start.getTime(), end.getTime()];
      }
      case 'year': {
        const start = new Date(now.getFullYear(), now.getMonth() - 11, 1, 0, 0, 0, 0);
        const end   = new Date(now.getFullYear(), now.getMonth() + 1,  1, 0, 0, 0, 0);
        return [start.getTime(), end.getTime()];
      }
    }
  };

  const generateTicks = (): number[] => {
    const ticks: number[] = [];
    switch (timeRange) {
      case 'day': {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        for (let h = 0; h <= 21; h += 3) {
          ticks.push(startOfDay.getTime() + h * 3600 * 1000);
        }
        break;
      }
      case 'week': {
        for (let i = 6; i >= 0; i--) {
          ticks.push(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0, 0).getTime());
        }
        break;
      }
      case 'month': {
        for (let i = 29; i >= 0; i--) {
          ticks.push(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0, 0).getTime());
        }
        break;
      }
      case 'year': {
        for (let i = 11; i >= 0; i--) {
          ticks.push(new Date(now.getFullYear(), now.getMonth() - i, 1, 0, 0, 0, 0).getTime());
        }
        break;
      }
    }
    return ticks;
  };

  const formatXAxis = (ms: number): string => {
    const d = new Date(ms);
    switch (timeRange) {
      case 'day':   return `${d.getHours().toString().padStart(2, '0')}:00`;
      case 'week':  return `${d.getDate()}/${d.getMonth() + 1}`;
      case 'month': return `${d.getDate()}`;
      case 'year':  return MONTHS[d.getMonth()];
    }
  };

  const formatTooltipLabel = (ms: number): string => {
    const d = new Date(ms);
    switch (timeRange) {
      case 'day':
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      case 'week':
      case 'month':
        return `${WEEK_DAYS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1} ${d.getHours().toString().padStart(2, '0')}:00`;
      case 'year':
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }
  };

  const timeRangeButtons: { label: string; value: TimeRange }[] = [
    { label: 'Año',    value: 'year'  },
    { label: 'Mes',    value: 'month' },
    { label: 'Semana', value: 'week'  },
    { label: 'Día',    value: 'day'   },
  ];

  const showDots = timeRange === 'day';

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      h={{ base: '320px', md: '380px', lg: '450px' }}
    >
      <Box
        bg="white"
        p={{ base: 4, md: 6 }}
        borderRadius="lg"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.200"
        h="100%"
        display="flex"
        flexDirection="column"
      >
        <HStack justify="space-between" mb={{ base: 3, md: 6 }} flexWrap="wrap" gap={2}>
          <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="600">
            Mediciones de Temperatura
          </Text>
          <HStack gap={0}>
            {timeRangeButtons.map((btn) => (
              <Button
                key={btn.value}
                size="sm"
                variant={timeRange === btn.value ? 'solid' : 'ghost'}
                onClick={() => onTimeRangeChange(btn.value)}
                bg={timeRange === btn.value ? 'brand.orange' : 'transparent'}
                color={timeRange === btn.value ? 'white' : 'gray.500'}
                _hover={{ bg: timeRange === btn.value ? '#E63E00' : 'gray.100' }}
                borderRadius="md"
              >
                {btn.label}
              </Button>
            ))}
          </HStack>
        </HStack>

        <Box flex={1} minH={0} position="relative">
          {isLoading && (
            <Box
              position="absolute"
              inset={0}
              zIndex={10}
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg="whiteAlpha.700"
              borderRadius="md"
            >
              <Spinner size="xl" color="brand.orange" borderWidth="3px" />
            </Box>
          )}
          {!isLoading && data.length === 0 && (
            <Box
              position="absolute"
              inset={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="gray.400" fontSize="sm">No hay datos de temperatura disponibles</Text>
            </Box>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filterData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
              <XAxis
                dataKey="time"
                type="number"
                scale="time"
                domain={getDomain()}
                ticks={generateTicks()}
                tickFormatter={formatXAxis}
                stroke="#6B6B6B"
                style={{ fontSize: '11px' }}
                interval={0}
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
                formatter={(value: any, name: any) => [`${value}°C`, name]}
                labelFormatter={(label: any) => formatTooltipLabel(label as number)}
              />
              {celdas.map((celda, index) => (
                <Line
                  key={celda.id}
                  type="monotone"
                  dataKey={`celda_${celda.id}`}
                  name={celda.nombre}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={showDots ? { fill: COLORS[index % COLORS.length], r: 3 } : false}
                  activeDot={{ r: 5 }}
                  connectNulls={true}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </MotionBox>
  );
};

export default TemperatureChart;
