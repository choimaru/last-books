import style from 'src/components/Footer/Footer.module.css';

export const Footer = () => {
  return (
    <footer className={style.footer}>
      <address className={style.address}>&copy; 2021 last-books</address>
    </footer>
  );
};
