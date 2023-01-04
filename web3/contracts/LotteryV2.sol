// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract VRFv2Consumer is VRFConsumerBaseV2, ConfirmedOwner {
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    struct RequestStatus {
        bool fulfilled; // whether the request has been successfully fulfilled
        bool exists; // whether a requestId exists
        uint256[] randomWords;
    }
    mapping(uint256 => RequestStatus)
        public s_requests; /* requestId --> requestStatus */
    VRFCoordinatorV2Interface COORDINATOR;

    // Your subscription ID.
    uint64 s_subscriptionId;

    // past requests Id.
    uint256[] public requestIds;
    uint256 private lastRequestId;

    /**
     *  keyHash and COORDINATOR configuration:
     *  - https://docs.chain.link/docs/vrf/v2/subscription/supported-networks/#configurations
     */
    bytes32 keyHash =
        0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;

    // Depends on the number of requested values that you want sent to the
    // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
    // so 100,000 is a safe default for this example contract. Test and adjust
    // this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in the fulfillRandomWords()
    // function.
    uint32 callbackGasLimit = 100_000;
    uint16 requestConfirmations = 3;

    // For this example, retrieve 2 random values in one request.
    // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
    uint32 numWords = 2;

    constructor(
        uint64 subscriptionId
    )
        VRFConsumerBaseV2(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed)
        ConfirmedOwner(msg.sender)
    {
        COORDINATOR = VRFCoordinatorV2Interface(
            0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed
        );
        s_subscriptionId = subscriptionId;
    }

    // Getter to obtain the lastRequestId.
    function getLastRequestId() external view returns (uint256) {
        return lastRequestId;
    }

    // Assumes the subscription is funded sufficiently.
    function requestRandomWords()
        external
        onlyOwner
        returns (uint256 requestId)
    {
        // Will revert if subscription is not set and funded.
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false
        });

        requestIds.push(requestId);
        lastRequestId = requestId;

        emit RequestSent(requestId, numWords);
        return requestId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        emit RequestFulfilled(_requestId, _randomWords);
    }

    function getRequestStatus(
        uint256 _requestId
    ) external view returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomWords);
    }
}

/**
 * @dev Implementation of a simple lottery contract using Chainlink's VRFv2.
 *
 *  References:
 *  - Generate a pseudo-random number.
 *      - https://docs.chain.link/vrf/v2/subscription/examples/get-a-random-number
 *      - https://vrf.chain.link/chapel
 */
contract Lottery is Ownable {
    // Cost of each token.
    uint256 private constant COST = 3 ether;

    // Maximum supply of the collection.
    uint256 private constant MAX_SUPPLY = 5;

    // Stores all the purchased tickets.
    uint256 private _allTokens;

    // Random words requested from Chainlink oracle.
    uint256[] private _randomWords;

    // Lottery id.
    uint256 public _lotteryId = 1;

    // Lottery history.
    mapping(uint256 => address) public _lotteryHistory;

    // Mapping to determine the ownership of a ticket in a certain lotteryId.
    mapping(uint256 => mapping(uint256 => address))
        private _ticketOwnershipHistory;

    // Mapping to determine the tickets of a certain address in a certain lotteryId.
    mapping(uint256 => mapping(address => uint256[]))
        private _ticketByOwnerHistory;

    // Boolean to see if the Chainlink oracle request is fulfilled.
    bool private _isFulfilled;

    // Lets you know wether the mint is paused or not.
    bool public _isPaused = true;

    // Lets you know wether the Chainlink's VRFv2 is connected or not.
    bool public _isVRFv2Connected = false;

    // FIXME: Fill with a real address.
    address private _liquidity = 0xfaeAD884FDaDA5B42E8fdd61EdF6286E7FC61b0A;

    // Array to store (in order) the players.
    address[] private _players;

    // Chainlink VRF v2.
    VRFv2Consumer private _vrf;

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    constructor() {}

    receive() external payable {} // FIXME: Necessary?

    fallback() external payable {} // FIXME: Necessary?

    // Events.
    // -----------------------
    event SetWinnerAddress(address);
    event SuccessfulPayment(bool);
    event SuccessfulContractConnection(address);
    event SuccessfulContractDisconnection(address);

    // Modifiers.
    // -----------------------
    /**
     * @dev Checks that the lottery is not finished.
     */
    modifier onlyIfLotteryNotEnded() {
        require(
            _lotteryHistory[_lotteryId] == address(0),
            "[Lottery]: La loteria todavia no ha comenzado o ha finalizado."
        );
        _;
    }

    modifier onlyIfIsPaused() {
        require(
            _isPaused == true,
            "[Lottery]: Es imprescindible que el contrato este pausado para realizar esta accion."
        );
        _;
    }

    // External.
    // -----------------------

    // Public.
    // -----------------------

    /**
     * @dev Change status of the boolean _isPaused.
     *
     * Requirements:
     *
     *  - {onlyOwner} modifier.
     */
    function playPause() public onlyOwner {
        require(
            address(_vrf) == address(0),
            "[Lottery]: No se puede despausar una vez este conectado el VRFv2."
        );
        _isPaused = !_isPaused;
    }

    /**
     * @dev Returns the current total supply.
     */
    function totalSupply() public view returns (uint256) {
        return _allTokens;
    }

    /**
     * @dev Function that lists the amount of tickets given a lottery id and an address.
     * @param lotteryId uint256 ID of the lottery.
     * @param owner address Address of the tickets.
     */
    function ticketAmountByLotteryIdAndAddress(
        uint256 lotteryId,
        address owner
    ) public view returns (uint256) {
        return _ticketByOwnerHistory[lotteryId][owner].length;
    }

    /**
     * @dev Function that returns the address of a given ticket in a certain lotteryId.
     * @param lotteryId uint256 ID of the lottery.
     * @param ticketId uint256 Ticket ID.
     */
    function ticketOwnershipByLotteryIdAndTicketId(
        uint256 lotteryId,
        uint256 ticketId
    ) public view returns (address) {
        return _ticketOwnershipHistory[lotteryId][ticketId];
    }

    /**
     * @dev Function that lists the tickets given a lottery id and an address.
     * @param lotteryId uint256 ID of the lottery.
     * @param owner address Address of the tickets.
     */
    function ticketByLotteryIdAndAddress(
        uint256 lotteryId,
        address owner
    ) public view returns (uint256[] memory) {
        return _ticketByOwnerHistory[lotteryId][owner];
    }

    /**
     * @dev Function that allows minting a set of loto tickets.
     * @param amount uint256 Amount of tickets to mint.
     *
     * Requirements:
     *
     *  - {onlyIfLotteryNotEnded} modifier.
     *  - amount must be greater than 0, i.e., a minimum purchase of 1 unit.
     *  - amount must not exceed the MAX_SUPPLY.
     */
    function mint(uint256 amount) public payable onlyIfLotteryNotEnded {
        require(_isPaused == false, "[Lottery]: El minteo esta pausado.");
        uint256 currentSupply = totalSupply();
        require(
            amount > 0,
            "[Lottery]: La cantidad minima es 1 unidad de token."
        );
        uint256 maxSupply = MAX_SUPPLY;
        require(
            currentSupply + amount <= maxSupply,
            "[Lottery]: Se excede la cantidad maxima disponible."
        );

        if (msg.sender != owner()) {
            uint256 cost = COST;
            require(
                msg.value >= cost * amount,
                "[Lottery]: Cantidad insuficiente."
            );
        }

        uint256 lotteryId = _lotteryId;
        for (uint256 i = 0; i < amount; i++) {
            _players.push(msg.sender);
            _ticketOwnershipHistory[lotteryId][currentSupply + i] = msg.sender;
            _ticketByOwnerHistory[lotteryId][msg.sender].push(
                currentSupply + i
            );
        }

        _allTokens += amount; // Puede crear problemas en lugar de hacerlo en el for indice por indice?
    }

    /**
     * @dev Function that connects this contract with a VRFv2Consumer contract.
     * @param vrfAddress address Address of the VRFv2Consumer contract.
     *
     * Requirements:
     *
     *  - {onlyOwner} modifier.
     *  - {onlyIfLotteryNotEnded} modifier.
     *  - VRFv2Consumer contract must exists within the blockchain.
     *
     * Emits a {SuccessfulContractConnection} event.
     */
    function connectToVRFv2ConsumerContract(
        address vrfAddress
    ) public onlyOwner onlyIfLotteryNotEnded onlyIfIsPaused {
        _vrf = VRFv2Consumer(vrfAddress);
        _isVRFv2Connected = true;
        emit SuccessfulContractConnection(address(_vrf));
    }

    /**
     * @dev Function that disconnects this contract from the previously connected VRFv2Consumer contract.
     *
     * Requirements:
     *
     *  - {onlyOwner} modifier.
     *
     * Emits a {SuccessfulContractDisconnection} event.
     */
    function disconnectFromVRFv2ConsumerContract() public onlyOwner {
        require(
            address(_vrf) != address(0),
            "[Lottery]: Todavia no se ha conectado al VRFv2."
        );
        _vrf = VRFv2Consumer(address(0));
        _isVRFv2Connected = false;
        emit SuccessfulContractDisconnection(address(_vrf));
    }

    /**
     * @dev Function that computes the winner of the lottery.
     * @param salt Deterministic number introduced by hand in order to prevent the random number exploit.
     *
     * Requirements:
     *
     *  - {onlyOwner} modifier.
     *  - {onlyIfLotteryNotEnded} modifier.
     *  - Mint must be paused.
     *  - allTokens must not be 0, due to the fact that this means there are no players on the game.
     *  - The winner must hold at least 1 share.
     *  - Call functions must succeed.
     *
     * Emits {SuccessfulPayment} events.
     */
    function computeWinner(
        uint256 salt
    ) public onlyOwner onlyIfLotteryNotEnded onlyIfIsPaused {
        // Retrieve in-game tokens.
        uint256 allTokens = totalSupply();
        require(allTokens > 0, "[Lottery]: No existen jugadores.");

        _getRandom();
        require(
            _isFulfilled == true,
            "[Lottery]: La request al oraculo de Chainlink esta pendiente de confirmacion."
        );
        // Compute a random number using hash(array of random words with a deterministic salt) modulo total supply.
        uint256 random = uint256(
            keccak256(abi.encodePacked(_randomWords, salt))
        ) % MAX_SUPPLY;

        // Select winner address.
        address winnerAddress = _players[random];
        uint256 lotteryId = _lotteryId;
        require(
            winnerAddress != address(0),
            "[Lottery]: La direccion no es valida."
        );
        require(
            ticketAmountByLotteryIdAndAddress(lotteryId, winnerAddress) > 0,
            "[Lottery]: El balance del ganador es inferior a 1."
        );
        require(
            ticketOwnershipByLotteryIdAndTicketId(lotteryId, random) ==
                winnerAddress,
            "[Lottery]: Fallo en la verificacion de la propiedad del ticket ganador."
        );

        // Send the prize to the winner, e.g., 90% of the total amount.
        (bool success, ) = winnerAddress.call{
            value: (address(this).balance * 90) / 100
        }("");
        require(success, "[Lottery]: Call a Winner fallido.");
        emit SuccessfulPayment(success);

        // FIXME: Save the rest of the balance in a Liquidity address.
        (success, ) = _liquidity.call{value: address(this).balance}("");
        require(success, "[Lottery]: Call a Liquidity fallido.");
        emit SuccessfulPayment(success);

        // Update and reset lottery values.
        _lotteryHistory[lotteryId] = winnerAddress;
        emit SetWinnerAddress(winnerAddress);

        _lotteryId++;
        _players = new address[](0);
        _isFulfilled = false;
        _allTokens = 0;
    }

    // Internal.
    // -----------------------

    // Private.
    // -----------------------
    /**
     * @dev Function that request random words to Chainlink oracle.
     *
     * Requirements:
     *
     *  - {onlyOwner} modifier.
     *  - {onlyIfLotteryNotEnded} modifier.
     *  - This contract must be connected to the VRFv2Consumer contract via `connectToVRFv2ConsumerContract()`.
     *
     */
    function _getRandom()
        private
        onlyOwner
        onlyIfLotteryNotEnded
        onlyIfIsPaused
    {
        VRFv2Consumer vrf = _vrf;
        require(
            address(vrf) != address(0),
            "[Lottery]: La direccion del VRFv2 no es valida."
        );

        // FIXME - ERROR References:
        //  - https://github.com/smartcontractkit/chainlink/blob/e1e78865d4f3e609e7977777d7fb0604913b63ed/contracts/src/v0.8/VRFCoordinatorV2.sol#L376
        //  - https://ethereum.stackexchange.com/questions/134835/chainlink-vrf-how-to-call-requestrandomwords-in-fulfillrandomwords
        //  - https://hackernoon.com/hack-solidity-reentrancy-attack
        uint256 requestId = vrf.getLastRequestId(); // FIXME: Esta funcionando porque esta cogiendo los resultados anteriores a esta ejecucion.
        //uint256 requestId = vrf.requestRandomWords();
        require(
            requestId != 0,
            "[Lottery]: Todavia no se ha realizado la request a Chainlink."
        );

        (_isFulfilled, _randomWords) = vrf.getRequestStatus(requestId);
    }
}
