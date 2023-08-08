import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function StructureToText({ generateStructureInfo }) {
    return (
        <div>
            <button onClick={generateStructureInfo}>Structure Search</button>
        </div>
    );
}

function Structure({ toggleStructure, generateStructureInfo }) {
    return (
        <div style={{ display: toggleStructure ? 'block' : 'none' }}>
            <div id="jsme_container" />
            <StructureToText generateStructureInfo={generateStructureInfo} />
        </div>
    );
}

function StructureToggleButton({ toggleStructure, handleToggleStructure }) {
    return (
        <div>
            <button
                onClick={() => {
                    handleToggleStructure(!toggleStructure);
                }}
            >
                Draw Structure
            </button>
        </div>
    );
}

function OrdersTableBody({ ordersList, tableHead }) {
    if (ordersList)
        return (
            <tbody>
                {ordersList.map((order, index) => {
                    return (
                        <tr key={index}>
                            {tableHead.map((head, index) => {
                                return <td key={index}>{order[head]}</td>;
                            })}
                        </tr>
                    );
                })}
            </tbody>
        );
}

function OrdersTableHead({ tableHead }) {
    return (
        <thead>
            <tr>
                {tableHead.map((head, index) => {
                    return <th key={index}>{head}</th>;
                })}
            </tr>
        </thead>
    );
}

function OrdersTable({ ordersList }) {
    const tableHead = ['chemicalName', 'CAS', 'username', 'amount'];

    return (
        <table>
            <OrdersTableHead tableHead={tableHead} />
            <OrdersTableBody ordersList={ordersList} tableHead={tableHead} />
        </table>
    );
}

function Searchbar({ handleSubmit, queryText, onQueryTextChange }) {
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={queryText}
                onChange={(e) => {
                    onQueryTextChange(e.target.value);
                }}
                placeholder="Chemical Name, CAS or username"
            />
        </form>
    );
}

export default function QueryOrder() {
    const [jsmeApplet, setJSME] = useState(null);
    const [RDKitMod, setRDKit] = useState(null);

    const [queryText, setQueryText] = useState('');
    const [ordersList, setOrdersList] = useState(null);

    const [toggleStructure, setToggleStructure] = useState(false);

    async function queryString() {
        const { data, error } = await supabase
            .from('ordersview')
            .select(
                'chemicalName, CAS, username, amount, amountUnit, isConsumed, supplierName, supplierPN, statusValue, orderDate'
            )
            .or(
                `chemicalName.ilike.%${queryText}%, username.ilike.%${queryText}%, CAS.ilike.%${queryText}%`
            );

        if (data) {
            setOrdersList(data);
        }
    }

    async function queryStructure(inchi: string) {
        const { data, error } = await supabase
            .from('ordersview')
            .select(
                'chemicalName, CAS, username, amount, amountUnit, isConsumed, supplierName, supplierPN, statusValue, orderDate'
            )
            .eq('inchi', inchi);

        if (data) {
            setOrdersList(data);
        }
    }

    function generateStructureInfo() {
        const smile = jsmeApplet.smiles();
        let inchi = '';
        if (smile) {
            inchi = RDKitMod!.get_mol(smile).get_inchi();
        }
        queryStructure(inchi);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        queryString();
    };

    useEffect(() => {
        const initJSMEApplet = new JSApplet.JSME(
            'jsme_container',
            '380px',
            '340px'
        );
        setJSME(initJSMEApplet);

        async function rdkit() {
            const initRDKitMod = await initRDKitModule();
            setRDKit(initRDKitMod);
        }
        rdkit();
    }, []);

    return (
        <div>
            <h2>Query the database here</h2>
            <Searchbar
                handleSubmit={handleSubmit}
                queryText={queryText}
                onQueryTextChange={setQueryText}
            />
            <StructureToggleButton
                toggleStructure={toggleStructure}
                handleToggleStructure={setToggleStructure}
            />
            <Structure
                toggleStructure={toggleStructure}
                generateStructureInfo={generateStructureInfo}
            />
            <div style={{ display: toggleStructure ? 'block' : 'none' }}>
                <div id="jsme_container" />
            </div>
            <OrdersTable ordersList={ordersList} />
            <button type="button" onClick={() => supabase.auth.signOut()}>
                Sign Out
            </button>
        </div>
    );
}
