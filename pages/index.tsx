import { ChatBox } from './../components/ChatBox';

export default function Home(): JSX.Element {
  return (
    <div className='container'>
      <main>
        <ChatBox />
      </main>

      <style jsx>{``}</style>

      <style jsx global>{`
        html,
        body {
          padding: 5px;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
