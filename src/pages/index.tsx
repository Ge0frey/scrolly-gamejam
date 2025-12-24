import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Scrolly Game Jam</title>
        <meta
          name="description"
          content="Scrolly Game Jam"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
