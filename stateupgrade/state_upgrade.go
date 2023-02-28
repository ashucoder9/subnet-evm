// (c) 2023 Ava Labs, Inc. All rights reserved.
// See the file LICENSE for licensing terms.

package stateupgrade

import (
	"math/big"

	"github.com/ava-labs/subnet-evm/params"
	"github.com/ethereum/go-ethereum/log"
)

func Configure(
	stateUpgrade *params.StateUpgrade,
	blockContext BlockContext,
	state StateDB,
) error {
	log.Info("Configuring state upgrade", "block", blockContext.Number(), "timestamp", blockContext.Timestamp())
	if err := addToBalance(stateUpgrade, state); err != nil {
		return err
	}
	if err := setStorage(stateUpgrade, state); err != nil {
		return err
	}
	if err := setCode(stateUpgrade, state); err != nil {
		return err
	}
	return nil
}

// addToBalance modifies the balances according to the [AddToBalance] map in [stateUpgrade].
func addToBalance(stateUpgrade *params.StateUpgrade, state StateDB) error {
	for account, amount := range stateUpgrade.AddToBalance {
		// TODO: is it necessary to call CreateAccount?
		// if there is no address in the state, create one.
		if !state.Exist(account) {
			state.CreateAccount(account)
		}

		bigIntAmount := (*big.Int)(amount)
		state.AddBalance(account, bigIntAmount)
	}
	return nil
}

// setStorage modifies the storage slots according to the [SetStorage] map in [stateUpgrade].
func setStorage(stateUpgrade *params.StateUpgrade, state StateDB) error {
	for account, storage := range stateUpgrade.SetStorage {
		for key, value := range storage {
			state.SetState(account, key, value)
		}
	}
	return nil
}

// setCode modifies the code according to the [SetCode] map in [stateUpgrade].
func setCode(stateUpgrade *params.StateUpgrade, state StateDB) error {
	for account, code := range stateUpgrade.SetCode {
		state.SetCode(account, code)
	}
	return nil
}
