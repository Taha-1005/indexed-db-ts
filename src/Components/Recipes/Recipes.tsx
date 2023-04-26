import { useEffect, useState } from 'react';
import './Styles.css';

const idb = window.indexedDB;

// type Recipe = {
//   foodProductId: number;
//   foodProductName: string;
// };

const createRecipeCollectionInIndexedDB = new Promise<string>(
  (resolve, reject) => {
    if (!idb) {
      console.log('no IDB');
      return;
    }

    // console.log('In create Recipe Data');

    const request = idb.open('restaurant-db', 2);

    request.onerror = (event) => {
      console.log('Error', event);
      console.log('Error with indexed db');
      reject('error occured');
    };

    request.onupgradeneeded = () => {
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
      resolve('Database opened');
    };
  }
);

function Recipes() {
  const [recipeData, setRecipeData] = useState<any>(null);

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
          const recipeQueryToPut = recipeStore.put(recipe);

          recipeQueryToPut.onsuccess = () => {
            tx.oncomplete = () => {
              db.close();
              // console.log('Following recipe added:' + recipe.FoodProductId);
            };
          };

          recipeQueryToPut.onerror = (event) => {
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

  const getAllRecipes = new Promise<any>((resolve, reject) => {
    // console.log('here in getting all recipes from Indexed DB');
    const dbPromise = idb.open('restaurant-db', 2);
    let data: any = null;

    dbPromise.onsuccess = () => {
      try {
        const db = dbPromise.result;
        const tx = db.transaction('recipes', 'readonly');
        const recipeStore = tx.objectStore('recipes');

        const recipeQuery = recipeStore.getAll();
        recipeQuery.onsuccess = () => {
          // console.log(recipeQuery.result);
          // return recipeQuery.result;
          resolve(recipeQuery.result);
        };

        recipeQuery.onerror = (event) => {
          console.log(
            'Error occured while fetching data from recipes Object Store'
          );
          console.log(event);
          reject(null);
        };

        tx.oncomplete = () => {
          db.close();
        };
      } catch (e: any) {
        console.log('Exception occured');
        console.log(e);
      }
    };
  });

  const fetchDataFromApi = new Promise<string>((resolve, reject) => {
    // console.log('here in fetch');
    fetch('http://localhost:8000/recipes', {
      method: 'GET',
    })
      .then((res) => res.json())
      .then(
        (result) => {
          console.log('The data has been fetched successfully from API');
          // console.log(result);
          storeDataIntoIndexedDb(result);
          resolve('Data stored successfully.');
        },
        (error) => {
          console.log('There is an error in fetching the recipe data from API');
          console.log(error);
          reject('Error occured in fetching the data from API');
        }
      );
  });

  useEffect(() => {
    const create = async () => {
      await createRecipeCollectionInIndexedDB;
      await fetchDataFromApi;
      const data = await getAllRecipes;
      // console.log(data);
      setRecipeData(data);
    };
    // createRecipeCollectionInIndexedDB.then(() =>
    //   fetchDataFromApi.then(() => {
    //     console.log('here in setDta');
    //     getAllRecipes();
    //   })
    // );
    create().catch(console.error);
    // console.log(recipeData);
  }, []);

  return (
    <div className='recipes'>
      <div className='recipe_cards'>
        {recipeData &&
          recipeData.map((recipe: any) => (
            <div key={recipe.FoodProductId}>{recipe.FoodProductId}</div>
          ))}
      </div>
      <div></div>
    </div>
  );
}

export default Recipes;
