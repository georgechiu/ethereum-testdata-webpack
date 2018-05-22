pragma solidity ^0.4.21;

/**
 * @title Test data contract for test firm
 * @author George Chiu <george.chiu@baluntek.com>
 * @dev This is a contract for test firm.
 */

contract TestdataFactory {
    
    event NewTestdataEvent(uint dataId, string name);
    
    modifier onlyOwnerOf(uint _dataId) {
        require(msg.sender == dataToOwner[_dataId]);
        _;
    }
    
    struct Testdata {
        string name;
        uint size;
        string hashcode;
    }
    
    Testdata[] testdata;
    
    mapping(uint => address) dataToOwner;
    mapping(address => uint) ownerDataCount;
    
    function _createTestdata(string _name, uint _size, string _hashcode) internal {
        uint id = testdata.push(Testdata(_name, _size, _hashcode)) - 1;
        dataToOwner[id] = msg.sender;
        ownerDataCount[msg.sender]++;
        emit NewTestdataEvent(id, _name);
    }
    
    function createTestdata(string _name, uint _size, string _hashcode) public {
        _createTestdata(_name, _size, _hashcode);
    }
    
    function getAllTestdata(address _owner) external view returns(uint[]) {
        uint[] memory result = new uint[](ownerDataCount[_owner]);
        uint counter = 0;
        
        for (uint i = 0; i < testdata.length; i++) {
            if (dataToOwner[i] == _owner) {
                result[counter] = i;
                counter++;
            }
        }
        
        return result;
    }
    
    function getTestdata(uint _dataId) external view onlyOwnerOf(_dataId) returns(string, uint, string) {
        return(testdata[_dataId].name, testdata[_dataId].size, testdata[_dataId].hashcode);
    }
    
    function getTestdataCount(address _owner) external view returns(uint) {
        return ownerDataCount[_owner];
    }
}