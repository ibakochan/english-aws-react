import React from 'react';
import Test from './components/Test';
import UserTestRecords from './components/UserTestRecords';
import TestCreate from './components/TestCreate';
import { UserProvider, useUser } from "./context/UserContext";
import './App.css';

function AppContent() {
  const { currentUser } = useUser();
  const { activity } = useUser();

  return (
    <>
      {currentUser?.teacher && activity !== "test" &&  (
        <div>
          <UserTestRecords />
        </div>
      )}
      {activity !== "user_records" &&  (
      <div>
        <Test />
      </div>
      )}

      {currentUser?.is_superuser && (
        <div>
          <TestCreate />
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
export default App;