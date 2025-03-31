
// Login.tsx
const Login = () => {
    const [credentials, setCredentials] = useState({email: '', password: ''});
    const navigate = useNavigate();
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const success = await login(credentials); // Usa la función login definida arriba
      if (success) {
        navigate('/puntos-ayuda'); // Redirige al dashboard después del login
      }
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={credentials.email}
          onChange={(e) => setCredentials({...credentials, email: e.target.value})}
          placeholder="Email"
        />
        <input
          type="password"
          value={credentials.password}
          onChange={(e) => setCredentials({...credentials, password: e.target.value})}
          placeholder="Password"
        />
        <button type="submit">Login</button>
      </form>
    );
  };

  export default Login;