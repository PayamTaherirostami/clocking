import React, { useState, useEffect } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import './a.css'

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY_FIREBASE,
  authDomain: "clocking-2ddc8.firebaseapp.com",
  projectId: "clocking-2ddc8",
  storageBucket: "clocking-2ddc8.firebasestorage.app",
  messagingSenderId: "34289662034",
  appId:process.env.REACT_APP_API_KEY_FIREBASE2
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [workDuration, setWorkDuration] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalFilteredHours, setTotalFilteredHours] = useState(null);
  const [translateX, setTranslateX] = useState(0);
  const speed = 0.3; // Adjust speed (lower = faster)

  useEffect(() => {
    const interval = setInterval(() => {
      setTranslateX((prev) => (prev <= -images.length * 150 ? 0 : prev - speed));
    }, 20); // Smooth movement

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    auth.onAuthStateChanged(setUser);
  }, []);

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
    if (!user) return;

    const q = query(
      collection(db, "time_logs"),
      where("userId", "==", user.uid),
      orderBy("timestamp")
    );

    const querySnapshot = await getDocs(q);
    const logsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate() // Convert Firestore timestamp to JS Date
    }));

    setLogs(logsData);
    calculateWorkDurationPerDay(logsData);
  };

  const handleClockAction = async (type) => {
    if (!user) return;
    setLoading(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
      await addDoc(collection(db, "time_logs"), {
        userId: user.uid,
        type,
        timestamp: new Date(),
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      });
      setLoading(false);
      fetchLogs(); // Refresh logs after action
    }, () => setLoading(false));
  };

  const calculateWorkDurationPerDay = (logsData) => {
    const workDurations = {};

    logsData.forEach(log => {
      const dateKey = log.timestamp.toISOString().split("T")[0]; // Get date as YYYY-MM-DD

      if (!workDurations[dateKey]) {
        workDurations[dateKey] = { clockIn: null, clockOut: null, lunchStart: null, lunchEnd: null, totalWorked: 0 };
      }

      if (log.type === "clock-in") workDurations[dateKey].clockIn = log.timestamp;
      if (log.type === "clock-out") workDurations[dateKey].clockOut = log.timestamp;
      if (log.type === "lunch-start") workDurations[dateKey].lunchStart = log.timestamp;
      if (log.type === "lunch-end") workDurations[dateKey].lunchEnd = log.timestamp;
    });

    Object.keys(workDurations).forEach(date => {
      const { clockIn, clockOut, lunchStart, lunchEnd } = workDurations[date];

      if (clockIn && clockOut) {
        let totalWorked = (clockOut - clockIn) / 1000 / 60; // Convert to minutes
        let lunchBreak = lunchStart && lunchEnd ? (lunchEnd - lunchStart) / 1000 / 60 : 0;
        workDurations[date].totalWorked = totalWorked - lunchBreak;
      }
    });

    setWorkDuration(workDurations);
    calculateTotalFilteredHours(workDurations);
  };

  const calculateTotalFilteredHours = (workDurations) => {
    if (!startDate || !endDate) return;

    let totalMinutes = 0;
    Object.keys(workDurations).forEach(date => {
      if (date >= startDate && date <= endDate) {
        totalMinutes += workDurations[date].totalWorked;
      }
    });

    setTotalFilteredHours(totalMinutes);
  };
  const images = [
    "/images/1.jfif",
   "/images/2.jfif",
   "/images/3.jfif",
   "/images/4.jfif",
   "/images/5.jfif",
   "/images/6.jfif",
   "/images/7.jfif",
   "/images/8.jfif",
   "/images/9.jfif",
   "/images/10.jfif",
   "/images/11.jfif",
   "/images/12.jfif",
   "/images/13.jfif",
   "/images/14.jfif",
   "/images/15.jfif",
  ];
  return (
    <div className="p-4 text-center" style={{ padding: 20 }}>
      <hr style={{
        border: 0,
        height: "3px",
        backgroundImage: "linear-gradient(to right, #f0f0f0, #00b9ff, #59d941, #f0f0f0)"
      }} />
      <div className="overflow-hidden w-full bg-gray-100 py-4">
        <div
          className="flex items-center flex-nowrap gap-8"
          style={{
            display: "flex",
            flexWrap: "nowrap", // Ensures logos stay in a single row
            whiteSpace: "nowrap",
            transform: `translateX(${translateX}px)`,
            transition: "transform 0s linear",
          }}
        >
          {[...images, ...images].map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Logo ${index + 1}`}
              className="mx-4"
              style={{
                height: "auto", // Maintains aspect ratio
                width: "100px", // Adjust as needed
                flexShrink: 0, // Prevents images from shrinking
                margin: "30px"
              }}
            />
          ))}
        </div>
      </div>
      <hr style={{
        border: 0,
        height: "3px",
        backgroundImage: "linear-gradient(to right, #f0f0f0, #00b9ff, #59d941, #f0f0f0)"
      }} />
      {user ? (
        <>
          <h2>Welcome, {user.displayName}</h2>
          <div style={{ maxWidth:"100%"}}>
          <button onClick={() => signOut(auth)} className="p-2 bg-red-500 text-white"  style={{marginTop:15, marginLeft:100}}>Logout</button>

</div>


          <div className="mt-4" style={{border:"2px solid green",  borderRadius:10,padding:10}}>
            <button onClick={() => handleClockAction("clock-in")} disabled={loading} className="m-2 p-2 bg-green-500 text-white">Clock In</button>
            <button onClick={() => handleClockAction("lunch-start")} disabled={loading} className="m-2 p-2 bg-yellow-500 text-white">Start Lunch</button>
            <button onClick={() => handleClockAction("lunch-end")} disabled={loading} className="m-2 p-2 bg-orange-500 text-white">End Lunch</button>
            <button onClick={() => handleClockAction("clock-out")} disabled={loading} className="m-2 p-2 bg-blue-500 text-white">Clock Out</button>
          </div>

          <h3 className="mt-4 text-lg font-semibold">Today's Actions</h3>
          <ul className="mt-2">
            {logs.map(log => (
              <li key={log.id} className="p-2 border-b">
                {log.type} - {log.timestamp.toLocaleTimeString()}
              </li>
            ))}
          </ul>
<hr/>

          {/* Display Daily Work Summary */}
          {workDuration && (
            <div className="mt-6">
              <h3 className="text-lg font-bold">Daily Work Summary</h3>
              <ul className="mt-2">
                {Object.keys(workDuration).map(date => (
                  <li key={date} className="p-2 border-b">
                    {date}: {Math.floor(workDuration[date].totalWorked / 60)}h {Math.round(workDuration[date].totalWorked % 60)}m
                  </li>
                ))}
              </ul>
            </div>
          )}
<hr/>
          {/* Date Range Inputs */}
          
          <div className="mt-4">
            <label>Start Date: </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 border m-2"
            />
            </div>
            <div className="mt-4"  style={{marginTop:20, marginBottom:20}}>
            <label>End Date: </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 border m-2"
              style={{marginLeft:14}}
            />
            </div>
            <div className="bt" style={{ display:"flex"}}>
            <button onClick={() => calculateTotalFilteredHours(workDuration)} className="p-2 bg-blue-500 text-white" style={{marginLeft:100}}>Filter</button>
          </div>
          {/* Display Total Work Hours for Selected Date Range */}
          {totalFilteredHours !== null && (
            <h3 className="mt-4 text-lg font-bold">
              Total Work Hours (Selected Dates): {Math.floor(totalFilteredHours / 60)}h {Math.round(totalFilteredHours % 60)}m
            </h3>
          )}
        </>
      ) : (
        <button onClick={() => signInWithPopup(auth, new GoogleAuthProvider())} className="p-2 bg-gray-500 text-white">Login with Google</button>
      )}
    </div>
  );
};

export default App;
