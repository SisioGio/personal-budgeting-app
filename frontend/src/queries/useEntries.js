// src/queries/useEntries.js
import { useQuery } from '@tanstack/react-query';
import apiClient from '../utils/apiClient';

export const useEntries = (scenarioId) =>
  useQuery({
    queryKey: ['entries', scenarioId],
    enabled: !!scenarioId,
    queryFn: async () => {
      const res = await apiClient.get('/entries', {
        params: { scenario_id: scenarioId },
      });
      return res.data.data;
    },
  });



  export const useForecast = ({
      scenarioId,
  timeFrame,
  periods,
  simulateYears,
}) =>
  useQuery({
    queryKey: [
      'entries-report',
      scenarioId,
      timeFrame,
      periods,
      simulateYears,
    ],
    enabled: !!scenarioId,
    queryFn: async () => {
      const params = {
        scenario_id: scenarioId,
        time_frame: timeFrame,
        periods,
        simulate_years: simulateYears,
      };

      const res = await apiClient.get('/private/entries', { params });
      return res.data.data;
    }})