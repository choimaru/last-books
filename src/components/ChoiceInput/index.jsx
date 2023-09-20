import { Button } from '@material-ui/core';
import { useCallback, useState } from 'react';
import style from 'src/components/ChoiceInput/ChoiceInput.module.css';

export const ChoiceInput = (props) => {
  const [value, setVale] = useState(props.isbn);

  const handleChoice = useCallback(async () => {
    props.returnIsbn(value);
  }, [value]);

  return (
    <div key={props.idx} className={style.choice}>
      <div className={style.lbl}>ISBN：</div>
      <div className={style.isbn}>
        <input
          type='text'
          value={value}
          onChange={(e) => {
            setVale(e.target.value);
          }}
        />
      </div>
      <div>
        <Button
          variant='contained'
          color='primary'
          size='small'
          onClick={handleChoice}
        >
          選択
        </Button>
      </div>
    </div>
  );
};
