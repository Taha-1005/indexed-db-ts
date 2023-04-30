import { MouseEventHandler } from 'react';
import './CardStyles.css';

interface Props {
  foodProductName: string;
  foodProductId: number;
  foodItemsCost: number;
  addInRecipeList: (foodProductId: number) => void;
  index: number;
}

function Card({
  foodProductName,
  foodProductId,
  foodItemsCost,
  addInRecipeList,
  index,
}: Props) {
  function handleFoodCardClick(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) {
    addInRecipeList(index);
  }

  return (
    // <div className='food_card' onClick={(foodProductId) => handleFoodCardClick}>
    <div className='food_card' onClick={handleFoodCardClick}>
      <p>{foodProductId}</p>
      <p>{foodProductName}</p>
      <p>{foodItemsCost}</p>
    </div>
  );
}

export default Card;
