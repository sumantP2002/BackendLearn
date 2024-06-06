import React, { useEffect, useState } from 'react';
import axios from 'axios'

const App = () => {
  const [jokes, setjokes] = useState([]);
  
  useEffect(() => {
    
     axios.get('/api/jokes')
     .then((res) => {
      setjokes(res.data);
     })
    .catch((e) => {
      console.log(e);
    })
  });

  return(
    <>
      <h1>FUll stack</h1>
      <p> Jokes : {jokes.length}</p>
      {
      jokes.map((joke, index) => (
        
        <div key={joke.created}>
          <h3>{joke.text}</h3>
          <h3>{joke.question}</h3>
          <h3>{joke.answer}</h3>
          <h3>{joke.author}</h3>
          <h3>{joke.rating}</h3>
          {
            joke.tags.map((tech, index) => (
              <h2>{tech}</h2>
            ))
          }
        </div>
        
      ))
    }
    </>
  )
}

export default App