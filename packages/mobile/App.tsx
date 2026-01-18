import { StatusBar } from 'expo-status-bar';
import { WeeklyView } from './src/screens/WeeklyView';

export default function App() {
  return (
    <>
      <WeeklyView />
      <StatusBar style="auto" />
    </>
  );
}
