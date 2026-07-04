import { useState, useEffect } from 'react';
import { demoFarmers, demoAssessments, demoAlerts, demoTimelineData } from '../mock/demoData.js';

// Simple event listener pattern to allow cross-component state updates
const listeners = new Set();

const getInitialState = () => {
  const isDemo = localStorage.getItem('kisangpt_demo_mode') === 'true';
  const farmerId = localStorage.getItem('kisangpt_demo_farmer_id') || 'demo-farmer-1';
  return { isDemo, farmerId };
};

let globalState = getInitialState();

const notifyListeners = () => {
  listeners.forEach(listener => listener(globalState));
};

export const setDemoMode = (isDemo) => {
  localStorage.setItem('kisangpt_demo_mode', isDemo ? 'true' : 'false');
  globalState.isDemo = isDemo;
  notifyListeners();
};

export const setDemoFarmerId = (id) => {
  localStorage.setItem('kisangpt_demo_farmer_id', id);
  globalState.farmerId = id;
  notifyListeners();
};

export function useDemoMode() {
  const [state, setState] = useState(globalState);

  useEffect(() => {
    const handleUpdate = (newState) => {
      setState({ ...newState });
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const currentFarmer = demoFarmers.find(f => f._id === state.farmerId) || demoFarmers[0];
  const currentAssessment = demoAssessments[state.farmerId] || null;
  const currentAlerts = demoAlerts[state.farmerId] || [];
  const currentTimeline = demoTimelineData[state.farmerId] || [];

  return {
    isDemo: state.isDemo,
    demoFarmerId: state.farmerId,
    currentFarmer,
    currentAssessment,
    currentAlerts,
    currentTimeline,
    farmers: demoFarmers,
    toggleDemoMode: () => setDemoMode(!state.isDemo),
    setDemoFarmer: (id) => setDemoFarmerId(id)
  };
}

export default useDemoMode;
