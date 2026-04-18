import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { HistoricalDataNode } from '../../hooks/useIoTHistory';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

type HistoryChartProps = {
  historyData: HistoricalDataNode[];
};

const HistoryChart = ({ historyData }: HistoryChartProps) => {
  if (!historyData || historyData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="analytics-outline" size={24} color={Colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>No trend data yet</Text>
        <Text style={styles.emptyText}>Waiting for historical sensor readings from your smart box.</Text>
      </View>
    );
  }

  // Map to gifted-charts format
  let maxGas = 0;
  const chartData = historyData.map((node, index) => {
    if (node.gas > maxGas) maxGas = node.gas;
    return {
      value: node.gas,
      label: index % 3 === 0 ? node.timestamp : '', // show every 3rd label to prevent crowding
    };
  });

  // Calculate dynamic upper bound for visual scale
  const yAxisMax = Math.max(80, maxGas + (maxGas * 0.2));

  // Determine line color dynamically based on newest value
  const latestGas = historyData[historyData.length - 1].gas;
  let lineColor = "#4CAF50"; // Fresh
  let gradientColor = "rgba(76, 175, 80, 0.2)";
  
  if (latestGas >= 100) {
      lineColor = "#F44336"; // Spoiled
      gradientColor = "rgba(244, 67, 54, 0.2)";
  } else if (latestGas >= 30) {
      lineColor = "#FFC107"; // Warning
      gradientColor = "rgba(255, 193, 7, 0.2)";
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Trend Analysis</Text>
          <Text style={styles.title}>Gas concentration</Text>
        </View>
        <View style={styles.readingPill}>
          <Text style={styles.readingLabel}>Latest</Text>
          <Text style={[styles.readingValue, { color: lineColor }]}>{latestGas} ppm</Text>
        </View>
      </View>
      <View style={styles.chartWrapper}>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 100}
          height={180}
          spacing={Dimensions.get('window').width / (Math.max(chartData.length, 5))}
          initialSpacing={10}
          color={lineColor}
          thickness={4}
          yAxisColor="transparent"
          xAxisColor="#E5E7EB"
          yAxisTextStyle={{ color: '#9CA3AF', fontSize: 10 }}
          xAxisLabelTextStyle={{ color: '#9CA3AF', fontSize: 10, width: 50, marginLeft: -10 }}
          dataPointsColor={lineColor}
          dataPointsRadius={4}
          curved
          isAnimated
          animationDuration={1000}
          rulesType="solid"
          rulesColor="#F3F4F6"
          areaChart
          startFillColor={gradientColor}
          endFillColor="transparent"
          startOpacity={0.9}
          endOpacity={0.1}
          maxValue={yAxisMax}
          noOfSections={4}
          formatYLabel={(label: string) => Math.round(Number(label)).toString()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 30,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(14, 142, 147, 0.08)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  readingPill: {
    alignItems: 'flex-end',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  readingLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
    fontWeight: '600',
  },
  readingValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  chartWrapper: {
    marginLeft: -10, // Better label alignment
  },
  emptyContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 30,
    padding: 30,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    borderWidth: 1,
    borderColor: 'rgba(14, 142, 147, 0.08)',
  },
  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFEFF',
    marginBottom: 14,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  }
});

export default HistoryChart;
