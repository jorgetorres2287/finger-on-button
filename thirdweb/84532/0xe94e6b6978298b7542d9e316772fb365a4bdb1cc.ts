import {
  prepareEvent,
  prepareContractCall,
  readContract,
  type BaseTransactionOptions,
  type AbiParameterToPrimitiveType,
} from "thirdweb";

/**
* Contract events
*/

/**
 * Represents the filters for the "Deposited" event.
 */
export type DepositedEventFilters = Partial<{
  depositorAddress: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"depositorAddress","type":"address"}>
}>;

/**
 * Creates an event object for the Deposited event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { depositedEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  depositedEvent({
 *  depositorAddress: ...,
 * })
 * ],
 * });
 * ```
 */
export function depositedEvent(filters: DepositedEventFilters = {}) {
  return prepareEvent({
    signature: "event Deposited(uint256 fid, uint256 amount, address indexed depositorAddress, string gameId, uint256 depositId)",
    filters,
  });
};
  

/**
 * Represents the filters for the "GameFundsWithdrawn" event.
 */
export type GameFundsWithdrawnEventFilters = Partial<{
  recipient: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"recipient","type":"address"}>
}>;

/**
 * Creates an event object for the GameFundsWithdrawn event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { gameFundsWithdrawnEvent } from "TODO";
 *
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  gameFundsWithdrawnEvent({
 *  recipient: ...,
 * })
 * ],
 * });
 * ```
 */
export function gameFundsWithdrawnEvent(filters: GameFundsWithdrawnEventFilters = {}) {
  return prepareEvent({
    signature: "event GameFundsWithdrawn(string gameId, address indexed recipient, uint256 amount)",
    filters,
  });
};
  

/**
* Contract read functions
*/



/**
 * Calls the "ADMIN" function on the contract.
 * @param options - The options for the ADMIN function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { ADMIN } from "TODO";
 *
 * const result = await ADMIN();
 *
 * ```
 */
export async function ADMIN(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x2a0acc6a",
  [],
  [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ]
],
    params: []
  });
};


/**
 * Represents the parameters for the "allDeposits" function.
 */
export type AllDepositsParams = {
  arg_0: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"","type":"uint256"}>
};

/**
 * Calls the "allDeposits" function on the contract.
 * @param options - The options for the allDeposits function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { allDeposits } from "TODO";
 *
 * const result = await allDeposits({
 *  arg_0: ...,
 * });
 *
 * ```
 */
export async function allDeposits(
  options: BaseTransactionOptions<AllDepositsParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xe77176c4",
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "uint256",
      "name": "fid",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "amount",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "depositorAddress",
      "type": "address"
    },
    {
      "internalType": "string",
      "name": "gameId",
      "type": "string"
    }
  ]
],
    params: [options.arg_0]
  });
};


/**
 * Represents the parameters for the "gameDeposits" function.
 */
export type GameDepositsParams = {
  arg_0: AbiParameterToPrimitiveType<{"internalType":"string","name":"","type":"string"}>
arg_1: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"","type":"uint256"}>
};

/**
 * Calls the "gameDeposits" function on the contract.
 * @param options - The options for the gameDeposits function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { gameDeposits } from "TODO";
 *
 * const result = await gameDeposits({
 *  arg_0: ...,
 *  arg_1: ...,
 * });
 *
 * ```
 */
export async function gameDeposits(
  options: BaseTransactionOptions<GameDepositsParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x8cf01a51",
  [
    {
      "internalType": "string",
      "name": "",
      "type": "string"
    },
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "uint256",
      "name": "fid",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "amount",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "depositorAddress",
      "type": "address"
    },
    {
      "internalType": "string",
      "name": "gameId",
      "type": "string"
    }
  ]
],
    params: [options.arg_0, options.arg_1]
  });
};


/**
 * Represents the parameters for the "gameTotalDeposits" function.
 */
export type GameTotalDepositsParams = {
  arg_0: AbiParameterToPrimitiveType<{"internalType":"string","name":"","type":"string"}>
};

/**
 * Calls the "gameTotalDeposits" function on the contract.
 * @param options - The options for the gameTotalDeposits function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { gameTotalDeposits } from "TODO";
 *
 * const result = await gameTotalDeposits({
 *  arg_0: ...,
 * });
 *
 * ```
 */
export async function gameTotalDeposits(
  options: BaseTransactionOptions<GameTotalDepositsParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x1004dc17",
  [
    {
      "internalType": "string",
      "name": "",
      "type": "string"
    }
  ],
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ]
],
    params: [options.arg_0]
  });
};


/**
 * Represents the parameters for the "getGameDeposits" function.
 */
export type GetGameDepositsParams = {
  gameId: AbiParameterToPrimitiveType<{"internalType":"string","name":"gameId","type":"string"}>
};

/**
 * Calls the "getGameDeposits" function on the contract.
 * @param options - The options for the getGameDeposits function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getGameDeposits } from "TODO";
 *
 * const result = await getGameDeposits({
 *  gameId: ...,
 * });
 *
 * ```
 */
export async function getGameDeposits(
  options: BaseTransactionOptions<GetGameDepositsParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x33f26437",
  [
    {
      "internalType": "string",
      "name": "gameId",
      "type": "string"
    }
  ],
  [
    {
      "components": [
        {
          "internalType": "uint256",
          "name": "fid",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "depositorAddress",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "gameId",
          "type": "string"
        }
      ],
      "internalType": "struct FingerOnButton.Deposit[]",
      "name": "",
      "type": "tuple[]"
    }
  ]
],
    params: [options.gameId]
  });
};


/**
 * Represents the parameters for the "isPlayerInGame" function.
 */
export type IsPlayerInGameParams = {
  user: AbiParameterToPrimitiveType<{"internalType":"address","name":"user","type":"address"}>
gameId: AbiParameterToPrimitiveType<{"internalType":"string","name":"gameId","type":"string"}>
};

/**
 * Calls the "isPlayerInGame" function on the contract.
 * @param options - The options for the isPlayerInGame function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { isPlayerInGame } from "TODO";
 *
 * const result = await isPlayerInGame({
 *  user: ...,
 *  gameId: ...,
 * });
 *
 * ```
 */
export async function isPlayerInGame(
  options: BaseTransactionOptions<IsPlayerInGameParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xc4177997",
  [
    {
      "internalType": "address",
      "name": "user",
      "type": "address"
    },
    {
      "internalType": "string",
      "name": "gameId",
      "type": "string"
    }
  ],
  [
    {
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }
  ]
],
    params: [options.user, options.gameId]
  });
};


/**
* Contract write functions
*/

/**
 * Represents the parameters for the "deposit" function.
 */
export type DepositParams = {
  fid: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"fid","type":"uint256"}>
gameId: AbiParameterToPrimitiveType<{"internalType":"string","name":"gameId","type":"string"}>
};

/**
 * Calls the "deposit" function on the contract.
 * @param options - The options for the "deposit" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { deposit } from "TODO";
 *
 * const transaction = deposit({
 *  fid: ...,
 *  gameId: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function deposit(
  options: BaseTransactionOptions<DepositParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0xf1215d25",
  [
    {
      "internalType": "uint256",
      "name": "fid",
      "type": "uint256"
    },
    {
      "internalType": "string",
      "name": "gameId",
      "type": "string"
    }
  ],
  []
],
    params: [options.fid, options.gameId]
  });
};




/**
 * Calls the "withdrawContractBalance" function on the contract.
 * @param options - The options for the "withdrawContractBalance" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { withdrawContractBalance } from "TODO";
 *
 * const transaction = withdrawContractBalance();
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function withdrawContractBalance(
  options: BaseTransactionOptions
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0xbfab3db9",
  [],
  []
],
    params: []
  });
};


/**
 * Represents the parameters for the "withdrawGameFunds" function.
 */
export type WithdrawGameFundsParams = {
  gameId: AbiParameterToPrimitiveType<{"internalType":"string","name":"gameId","type":"string"}>
recipient: AbiParameterToPrimitiveType<{"internalType":"address payable","name":"recipient","type":"address"}>
};

/**
 * Calls the "withdrawGameFunds" function on the contract.
 * @param options - The options for the "withdrawGameFunds" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { withdrawGameFunds } from "TODO";
 *
 * const transaction = withdrawGameFunds({
 *  gameId: ...,
 *  recipient: ...,
 * });
 *
 * // Send the transaction
 * ...
 *
 * ```
 */
export function withdrawGameFunds(
  options: BaseTransactionOptions<WithdrawGameFundsParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0xc84548d9",
  [
    {
      "internalType": "string",
      "name": "gameId",
      "type": "string"
    },
    {
      "internalType": "address payable",
      "name": "recipient",
      "type": "address"
    }
  ],
  []
],
    params: [options.gameId, options.recipient]
  });
};


