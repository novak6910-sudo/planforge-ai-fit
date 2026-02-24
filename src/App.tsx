export default function App() {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>GymPlanner</h1>
      <p>Your fitness tracking app</p>
      <form style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Exercise: </label>
          <input type="text" placeholder="e.g., Bench Press" />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Reps: </label>
          <input type="number" placeholder="10" />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Weight (lbs): </label>
          <input type="number" placeholder="225" />
        </div>
        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>Log Workout</button>
      </form>
    </div>
  );
}
