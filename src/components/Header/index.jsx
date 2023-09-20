import style from 'src/components/Header/Header.module.css';
import Link from 'next/link';
import Image from 'next/image';
import logo from 'public/logo.png';

export const Header = () => {
  return (
    <header className={style.header}>
      <div className={style.box_logo}>
        <Link href='/'>
          <a>
            <Image src={logo} alt='logo image' width={40} height={36} />
          </a>
        </Link>
        <Link href='/'>
          <a className={style.logo}>最後の本</a>
        </Link>
      </div>
      <div className={style.description}>～ 同本再購入防止 ～</div>
    </header>
  );
};
