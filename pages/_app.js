// pages/_app.js
import '../style.css'
import 'bootstrap/dist/css/bootstrap.min.css';


export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}