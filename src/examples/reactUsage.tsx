import React from 'react';
import { createAxiosContext, useApiCall, useAuth } from '../react/hooks';
import { manager, api } from './basicUsage';

// Crear el contexto con el tipo de nuestras rutas
const { Provider: AxiosProvider, useApi, useManager } = createAxiosContext<typeof apiRoutes>();

// Ejemplo de componente con el hook useApiCall
function UserProfile({ userId }: { userId: number }) {
  const manager = useManager();
  const { execute, loading, error, data: user } = useApiCall(manager);

  React.useEffect(() => {
    execute(() => api.users.getById({ id: userId }));
  }, [userId, execute]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// Ejemplo de componente con autenticación
function LoginForm() {
  const manager = useManager();
  const { login } = useAuth(manager);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { execute, loading, error } = useApiCall(manager);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await execute(() => 
        api.auth.login({ email, password })
      );
      
      if (response?.token) {
        login(response.token);
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <div style={{ color: 'red' }}>{error.message}</div>}
    </form>
  );
}

// App principal con el provider
function App() {
  return (
    <AxiosProvider manager={manager}>
      <div>
        <h1>My App</h1>
        <LoginForm />
        <UserProfile userId={1} />
      </div>
    </AxiosProvider>
  );
}

export default App;