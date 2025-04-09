
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TimeRangeSelectorProps {
  timeRange: 'week' | 'month' | 'year';
  onTimeRangeChange: (value: 'week' | 'month' | 'year') => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ timeRange, onTimeRangeChange }) => {
  return (
    <Card className="p-1">
      <CardContent className="p-0">
        <Tabs defaultValue={timeRange} value={timeRange} onValueChange={(value) => onTimeRangeChange(value as 'week' | 'month' | 'year')}>
          <TabsList>
            <TabsTrigger value="week">أسبوع</TabsTrigger>
            <TabsTrigger value="month">شهر</TabsTrigger>
            <TabsTrigger value="year">سنة</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TimeRangeSelector;
