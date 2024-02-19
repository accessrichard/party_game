import { useEffect } from 'react';
import { history } from './store';


export default function useBackButtonBlock() {
    useEffect(() => {
        const unblock = history.block((tx) => {
            if (tx.action === "POP" && tx.location.pathname === "/lobby") {
                return false;
            }

            if (tx.action === "PUSH" && tx.location.pathname === "/") {
                //// Prevent console error when refresh page.
                unblock();
                return true;
            }

            unblock();
            tx.retry();
            return true;
        });

        return () => {
            unblock();
        };
    }, []);
}

