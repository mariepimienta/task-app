export function Test() {
  return (
    <div style={{ padding: '20px', fontSize: '24px', background: 'lightblue' }}>
      <h1>Test Page - If you can see this, React is working!</h1>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}
