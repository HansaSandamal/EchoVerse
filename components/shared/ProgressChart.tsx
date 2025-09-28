import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { JournalEntry } from '../../types';
import { format } from 'date-fns';

interface ProgressChartProps {
    data: JournalEntry[];
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const originalDateISO = payload[0].payload.date;
    return (
      <div className="p-3 bg-content-light dark:bg-content-dark border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
        <p className="label font-semibold text-text-primary-light dark:text-text-primary-dark">{`${format(new Date(originalDateISO), 'MMM d, yyyy')}`}</p>
        <p className="intro text-accent-light dark:text-accent-dark">{`Sentiment Rating: ${payload[0].value}`}</p>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{`Mood: ${payload[0].payload.detectedMood}`}</p>
      </div>
    );
  }

  return null;
};

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
    const formattedData = data.map(entry => ({
        ...entry,
        date: entry.date, 
        name: format(new Date(entry.date), 'M/d'),
    }));
    
    const themeColors = useMemo(() => {
        if (typeof window === 'undefined') {
            return { tickColor: '#9CA3AF', gridColor: '#2D3748', strokeColor: '#A78BFA' };
        }
        const isDark = document.documentElement.classList.contains('dark');
        const computedStyles = getComputedStyle(document.documentElement);
        
        return {
            tickColor: isDark ? computedStyles.getPropertyValue('--color-text-secondary-dark').trim() : computedStyles.getPropertyValue('--color-text-secondary-light').trim(),
            gridColor: isDark ? '#2D3748' : '#E2E8F0',
            strokeColor: isDark ? computedStyles.getPropertyValue('--color-accent-dark').trim() : computedStyles.getPropertyValue('--color-accent-light').trim()
        };
    }, [data]); // Recalculate if data changes, implying a re-render where theme might have changed.


    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={formattedData}
                margin={{
                    top: 5,
                    right: 20,
                    left: -20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor}/>
                <XAxis dataKey="name" tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="rating" stroke={themeColors.strokeColor} strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default ProgressChart;