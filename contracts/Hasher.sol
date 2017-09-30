pragma solidity ^0.4.11;

/// @title Store Time-stamped Transaction Details
contract Hasher {
    uint txId;
    
    event Stored(bytes32 indexed _txHash, uint indexed _time, uint indexed _txId);
    
    //stores tx details
    struct TxDetails {
        bytes32 txHash;
        uint timestamp;
    }
    
    mapping(bytes32 => uint) txIdByTxHash; //makes txId searchable with a txHash
    mapping(uint => TxDetails) txDetailsByTxId; //saves txDetails for an Id
    
    
    //change this to require txId input instead of auto generating
    /// @notice This stores `_txHash` on the blockchain 
    /// together with an auto generated timestamp.
    /// @param _txHash Hash of the transaction details and requirements.
    /// @return The timestamp provided as an argument.
    function storeDetails(bytes32 _txHash) returns (uint _time) {
        ++txId;
        _time = now;
        txDetailsByTxId[txId] = TxDetails(_txHash, _time);
        txIdByTxHash[_txHash] = txId;
        Stored(_txHash, _time, txId);
    }
    
    function showTxDetails(uint _txId) constant returns (bytes32 _txHash, uint _time) {
        var t = txDetailsByTxId[_txId];
        return (t.txHash, t.timestamp);
    }
    
    function showTxId(bytes32 _txHash) constant returns (uint _txId, uint _time) {
        _txId = txIdByTxHash[_txHash];
        var t = txDetailsByTxId[_txId];
        return (_txId, t.timestamp);
    }
}