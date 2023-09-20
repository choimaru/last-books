import style from 'src/styles/Home.module.css';
import { Auth, Button, IconLogOut } from '@supabase/ui';
import { LayoutWrapper } from 'src/components/LayoutWrapper';
import { MainBooks } from 'src/components/MainBooks';
import { client } from 'src/libs/supabase';

const Container = (props) => {
  const { user } = Auth.useUser();

  // ログインしている場合
  if (user) {
    return (
      <div className={style.main}>
        <MainBooks uid={user.id} />
        <div className={style.logout}>
          <Button
            block
            size='medium'
            icon={<IconLogOut />}
            onClick={() => client.auth.signOut()}
          >
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  // ログインしていない場合
  return <>{props.children}</>;
};

const Home = () => {
  return (
    <LayoutWrapper>
      <Auth.UserContextProvider supabaseClient={client}>
        <Container>
          <Auth
            supabaseClient={client}
            providers={['github', 'twitter', 'facebook']}
            socialColors={true}
          />
        </Container>
      </Auth.UserContextProvider>
    </LayoutWrapper>
  );
};

export default Home;
