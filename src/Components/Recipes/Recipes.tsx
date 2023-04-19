import { useEffect } from 'react';
import './Styles.css';

const idb = window.indexedDB;

// type Recipe = {
//   foodProductId: number;
//   foodProductName: string;
// };

const createRecipeCollectionInIndexedDB = () => {
  if (!idb) {
    console.log('no IDB');
    return;
  }

  console.log(idb);

  const request = idb.open('restaurant-db', 2);

  request.onerror = (event) => {
    console.log('Error', event);
    console.log('Error with indexed db');
  };

  request.onupgradeneeded = (event) => {
    // some change like make a new user collection

    const db = request.result;

    if (!db.objectStoreNames.contains('recipes')) {
      // object store is a collection like a table in a normal DB
      // keyPath is used in the put method and matches with the keyPath. It should be unique
      // put is upsert
      db.createObjectStore('recipes', { keyPath: 'FoodProductId' });
    }
  };

  request.onsuccess = () => {
    // the data / collection has been created or we can add some data here
    console.log('Database opened successfully.');
  };
};

function Recipes() {
  // const [recipeData, setRecipeData] = useState<any>();

  function storeDataIntoIndexedDb(recipeData: any) {
    const dbPromise = idb.open('restaurant-db', 2);

    dbPromise.onsuccess = () => {
      try {
        recipeData.map((recipe: any) => {
          // transaction is created for each query and it is closed when the query is completed
          // The db is closed after the transaction is closed.

          const db = dbPromise.result;
          const tx = db.transaction('recipes', 'readwrite');
          const recipeStore = tx.objectStore('recipes');
          const recipeQuery = recipeStore.put(recipe);

          recipeQuery.onsuccess = () => {
            tx.oncomplete = () => {
              db.close();
              // console.log('Following recipe added:' + recipe.FoodProductId);
            };
          };

          recipeQuery.onerror = (event) => {
            console.log(
              'Error occured while storing data into indexed Db:' +
                recipe.FoodProductId
            );
            console.log(event);
          };
        });
      } catch (e: any) {
        console.log('Exception occured');
        console.log(e);
      }
    };
  }

  useEffect(() => {
    createRecipeCollectionInIndexedDB();
    fetch('http://localhost:8000/recipes', {
      method: 'GET',
    })
      .then((res) => res.json())
      .then(
        (result) => {
          console.log('The data has been fetched successfully');
          console.log(result);
          storeDataIntoIndexedDb(result);
        },
        (error) => {
          console.log('There is an error in fetching the recipe data');
          console.log(error);
        }
      );
  }, []);

  return <div>Hello these are the recipes</div>;
}

export default Recipes;
