import { MouseEventHandler, useEffect, useState } from 'react';
import './RecipeStyles.css';
import Card from '../RecipeCard/Card';
import { json } from 'stream/consumers';

interface Order {
  OrderId: number;
  OrderDate: string;
  ItemId: number;
  ItemName: string;
  ItemAmount: number;
}

const idb = window.indexedDB;

function Recipes() {
  const [recipeData, setRecipeData] = useState<[] | any>();
  const [allOrdersInDb, setAllOrdersInDb] = useState<[] | any>();
  const [recipeOrder, setRecipeOrder] = useState<any>([]);
  const [orderCost, setOrderCost] = useState<number>(0);

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
        reject(new Error('error occured'));
      };

      request.onupgradeneeded = () => {
        // some change like make a new user collection

        const db = request.result;

        if (!db.objectStoreNames.contains('recipes')) {
          db.createObjectStore('recipes', { keyPath: 'FoodProductId' });
        }

        if (!db.objectStoreNames.contains('orderDetails')) {
          db.createObjectStore('orderDetails', { keyPath: 'OrderId' });
        }
      };

      request.onsuccess = () => {
        // the data / collection has been created or we can add some data here
        // console.log('Database opened successfully.');
        resolve('Database opened');
      };
    }
  );

  function storeDataIntoIndexedDb(recipeData: any) {
    // console.log('storing');
    if (recipeData === 'no data') {
      return;
    }
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
          reject(
            new Error(
              'Error occured while fetching data from recipes Object Store'
            )
          );
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
    fetch('http://168.187.115.103:92/api/FoodProduct', {
      method: 'GET',
    })
      .then((res) => res.json())
      .then(
        (result) => {
          // console.log('The data has been fetched successfully from API');
          // console.log(result);
          // storeDataIntoIndexedDb(result);
          resolve(result);
        },
        (error) => {
          console.log('There is an error in fetching the recipe data from API');
          console.log(error);
          resolve('no data');
        }
      );
  });

  function getTodayDate() {
    const date = new Date();
    let currentDay = String(date.getDate()).padStart(2, '0');
    let currentMonth = String(date.getMonth() + 1).padStart(2, '0');
    let currentYear = date.getFullYear();
    // we will display the date as DD-MM-YYYY
    let currentDate = `${currentDay}-${currentMonth}-${currentYear}`;
    return currentDate;
  }

  function getAllOrders() {
    console.log('Getting all orders');
    const dbPromise = idb.open('restaurant-db', 2);

    dbPromise.onsuccess = () => {
      try {
        const db = dbPromise.result;
        const tx = db.transaction('orderDetails', 'readonly');
        const orderStore = tx.objectStore('orderDetails');

        const recipeQuery = orderStore.getAll();
        recipeQuery.onsuccess = () => {
          setAllOrdersInDb(recipeQuery.result);
          console.log(allOrdersInDb);
        };

        recipeQuery.onerror = (event) => {
          console.log(
            'Error occured while fetching data from orders Object Store'
          );
          console.log(event);
        };

        tx.oncomplete = () => {
          db.close();
        };
      } catch (e: any) {
        console.log('Exception occured');
        console.log(e);
      }
    };
  }

  async function sendOrderToApi(orderData: Order) {
    // const toSend = {
    //   OrderId: orderData.orderId,
    //   OrderDate: orderData.orderDate,
    //   ItemId: orderData.itemId,
    //   ItemName: orderData.itemName,
    //   ItemAmount: orderData.itemAmount,
    // };

    await fetch('http://168.187.115.103:92/api/Order', {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.parse(JSON.stringify(orderData)),
    }).then(async (result) => {
      const resultInJson = await result.json();
      console.log(resultInJson);
    });
  }

  function storeOrderintoIndexedDb(orderData: Order) {
    const dbPromise = idb.open('restaurant-db', 2);

    dbPromise.onsuccess = () => {
      try {
        // transaction is created for each query and it is closed when the query is completed
        // The db is closed after the transaction is closed.

        const db = dbPromise.result;
        const tx = db.transaction('orderDetails', 'readwrite');
        const orderStore = tx.objectStore('orderDetails');
        const orderQueryToPut = orderStore.put(orderData);

        orderQueryToPut.onsuccess = () => {
          tx.oncomplete = () => {
            db.close();
            // console.log('Following recipe added:' + recipe.FoodProductId);
          };
        };

        orderQueryToPut.onerror = (event) => {
          console.log(
            'Error occured while storing data into indexed Db:' +
              orderData.OrderId
          );
          console.log(event);
        };
      } catch (e: any) {
        console.log('Exception occured');
        console.log(e);
      }
    };
  }

  function pushOrderDataToApiOrStoreInDatabase(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    console.log('Sending');
    const recipeIndex = recipeOrder[0];
    const orderToSend: Order = {
      OrderId: 1,
      OrderDate: getTodayDate(),
      ItemId: recipeData[recipeIndex].FoodProductId,
      ItemName: recipeData[recipeIndex].FoodProductName,
      ItemAmount: recipeData[recipeIndex].FoodItemsCost,
    };

    sendOrderToApi(orderToSend).catch((error) => {
      console.log('Error is posting order', orderToSend);
      console.log(error);
    });

    storeOrderintoIndexedDb(orderToSend);
  }

  useEffect(() => {
    const create = async () => {
      const one = await createRecipeCollectionInIndexedDB;
      console.log(one);
      await fetchDataFromApi.then((result) => {
        storeDataIntoIndexedDb(result);
      });
      await getAllRecipes.then((data) => {
        console.log(data);
        console.log('setting');
        setRecipeData(data);
      });
    };
    create().catch(console.error);
  }, []);

  useEffect(() => {
    getAllOrders();
    console.log(allOrdersInDb);
  }, [2]);

  function addInRecipeList(recipeIndex: number) {
    // console.log(recipeIndex);
    let newRecipeOrder = [...recipeOrder];
    newRecipeOrder?.push(recipeIndex);
    setRecipeOrder(newRecipeOrder);
    setOrderCost(orderCost + recipeData[recipeIndex].FoodItemsCost);
  }

  // console.log(recipeData);
  return (
    <div className='recipes'>
      <div className='recipe_cards'>
        {recipeData &&
          recipeData.length > 0 &&
          recipeData.map((recipe: any, recipeIndex: number) => (
            <Card
              key={recipe.FoodProductId}
              foodProductId={recipe.FoodProductId}
              foodProductName={recipe.FoodProductName}
              foodItemsCost={recipe.FoodItemsCost}
              addInRecipeList={addInRecipeList}
              index={recipeIndex}
            />
          ))}
      </div>
      <div className='recipe_order'>
        {recipeOrder.map((recipeIndex: number, orderIndex: number) => (
          <div key={orderIndex}>
            <p>
              {recipeData[recipeIndex].FoodProductName} -{' '}
              {recipeData[recipeIndex].FoodItemsCost}
            </p>
          </div>
        ))}
        <p>Total Cost - {orderCost}</p>
        <button onClick={pushOrderDataToApiOrStoreInDatabase}>
          Place the order
        </button>
      </div>
      <div>
        {allOrdersInDb &&
          allOrdersInDb.map((orderData: Order, orderIndex: number) => {
            <div key={orderIndex}>{orderData.ItemName}</div>;
          })}
      </div>
    </div>
  );
}

export default Recipes;
