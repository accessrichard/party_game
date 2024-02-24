import { useEffect } from 'react';
import { history } from './store';


export default function useBackButtonBlock(isEnabled) {
    useEffect(() => {
        const unblock = history.block((tx) => {
            if (!isEnabled) {
                return true;
            }

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
    }, [isEnabled]);
}

