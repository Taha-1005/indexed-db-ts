import { useEffect, useState } from 'react';
import './App.css';
import Recipes from './Components/Recipes/Recipes';

const idb = window.indexedDB;

const createCollectionsInIndexedDB = () => {
  if (!idb) {
    console.log('no IDB');
    return;
  }

  console.log(idb);

  const request = idb.open('test-db', 2);

  request.onerror = (event) => {
    console.log('Error', event);
    console.log('Error with indexed db');
  };

  request.onupgradeneeded = (event) => {
    // some change like make a new user collection

    const db = request.result;

    if (!db.objectStoreNames.contains('userData')) {
      // object store is a collection like a table in a normal DB
      // keyPath is used in the put method and matches with the keyPath. It should be unique
      // put is upsert
      db.createObjectStore('userData', { keyPath: 'id' });
    }
  };

  request.onsuccess = () => {
    // the data / collection has been created or we can add some data here
    console.log('Database opened successfully.');
  };
};

function App() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [allUserData, setAllUsersData] = useState<any>([]);
  const [addUser, setAddUser] = useState(false);
  const [editUser, setEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<null | { id: any }>({
    id: null,
  });

  const handleSubmit = () => {
    const dbPromise = idb.open('test-db', 2);

    if (firstName && lastName && email) {
      dbPromise.onsuccess = () => {
        const db = dbPromise.result;

        // transaction is created for each query and it is closed when the query is completed
        // The db is closed after the transaction is closed.
        const tx = db.transaction('userData', 'readwrite');

        const userData = tx.objectStore('userData');

        if (addUser) {
          const users = userData.put({
            id: allUserData?.length + 1,
            firstName,
            lastName,
            email,
          });

          users.onsuccess = () => {
            tx.oncomplete = () => {
              db.close();
            };
            getAllData();
            alert('User added');
          };

          users.onerror = (event) => {
            console.log(event);
            alert('Error occured');
          };
        } else {
          const users = userData.put({
            id: selectedUser?.id,
            firstName,
            lastName,
            email,
          });

          users.onsuccess = () => {
            tx.oncomplete = () => {
              db.close();
            };
            getAllData();
            alert('User updated');
          };

          users.onerror = (event) => {
            console.log(event);
            alert('Error occured');
          };
        }
      };
    }
  };

  const deleteUserHandle = (user: any) => {
    const dbPromise = idb.open('test-db', 2);

    dbPromise.onsuccess = () => {
      const db = dbPromise.result;

      const tx = db.transaction('userData', 'readwrite');

      const userData = tx.objectStore('userData');

      const deletedUser = userData.delete(user?.id);

      deletedUser.onsuccess = (query) => {
        alert('User Deleted');
        getAllData();
      };

      deletedUser.onerror = () => {
        alert('Error occured while deleting user');
      };

      tx.oncomplete = () => {
        db.close();
      };
    };
  };

  const getAllData = () => {
    const dbPromise = idb.open('test-db', 2);

    dbPromise.onsuccess = () => {
      const db = dbPromise.result;

      const tx = db.transaction('userData', 'readonly');

      const userData = tx.objectStore('userData');

      const users = userData.getAll();

      users.onsuccess = () => {
        setAllUsersData(users.result);
      };

      users.onerror = () => {
        alert('Error occ  ured data while loading initial data');
      };

      tx.oncomplete = () => {
        db.close();
      };
    };
  };

  useEffect(() => {
    // createCollectionsInIndexedDB();
    // getAllData();
  }, []);

  return (
    // <div className='row' style={{ padding: 100 }}>
    //   <div className='col-md-6'>
    //     <button
    //       className='btn btn-primary float-end mb-2'
    //       onClick={() => {
    //         setAddUser(true);
    //         setEditUser(false);
    //         setSelectedUser({ id: null });
    //         setFirstName('');
    //         setLastName('');
    //         setEmail('');
    //       }}
    //     >
    //       Add
    //     </button>
    //     <table className='table table-bordered w-100'>
    //       <thead>
    //         <tr>
    //           <th>First Name</th>
    //           <th>Last Name</th>
    //           <th>Email</th>
    //           <th>Actions</th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {allUserData?.map((row: any) => (
    //           <tr key={row?.id}>
    //             <td>{row?.firstName}</td>
    //             <td>{row?.lastName}</td>
    //             <td>{row?.email}</td>
    //             <td>
    //               <button
    //                 className='btn btn-success'
    //                 onClick={() => {
    //                   setAddUser(false);
    //                   setEditUser(true);
    //                   setSelectedUser(row);
    //                   setFirstName(row?.firstName);
    //                   setLastName(row?.lastName);
    //                   setEmail(row?.email);
    //                 }}
    //               >
    //                 Edit
    //               </button>{' '}
    //               <button
    //                 className='btn btn-danger'
    //                 onClick={() => deleteUserHandle(row)}
    //               >
    //                 Delete
    //               </button>
    //             </td>
    //           </tr>
    //         ))}
    //       </tbody>
    //     </table>
    //   </div>

    //   <div className='col-md-6'>
    //     {addUser || editUser ? (
    //       <div className='card' style={{ padding: '20px' }}>
    //         <h3>{editUser ? 'Update' : 'Add'} User</h3>
    //         <div className='form-group'>
    //           <label>First Name</label>
    //           <input
    //             type='text'
    //             name='firstName'
    //             className='form-control'
    //             onChange={(e) => setFirstName(e.target.value)}
    //             value={firstName}
    //           />
    //         </div>
    //         <div className='form-group'>
    //           <label>Last Name</label>
    //           <input
    //             type='text'
    //             name='lastName'
    //             className='form-control'
    //             onChange={(e) => setLastName(e.target.value)}
    //             value={lastName}
    //           />
    //         </div>
    //         <div className='form-group'>
    //           <label>Email</label>
    //           <input
    //             type='email'
    //             name='email'
    //             className='form-control'
    //             onChange={(e) => setEmail(e.target.value)}
    //             value={email}
    //           />
    //         </div>
    //         <div className='form-group'>
    //           <button className='btn btn-primary mt-2' onClick={handleSubmit}>
    //             {editUser ? 'Update' : 'Add'}
    //           </button>
    //         </div>
    //       </div>
    //     ) : null}
    //   </div>
    // </div>
    <>
      <Recipes />
    </>
  );
}

export default App;
