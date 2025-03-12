// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PongToken
 * @dev ERC20 Token used to reward players based on their game score.
 * Features include:
 *  - Standard ERC20 functionality.
 *  - Burnability.
 *  - Pausability (emergency stop in case of issues).
 *  - Role-based access control: only accounts with the MINTER_ROLE
 *    can mint tokens (e.g. your backend API after proper auth).
 */
contract PongToken is ERC20, ERC20Burnable, Pausable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    uint256 public constant SCORE_CONVERSION = 1;

    constructor(
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(BURNER_ROLE, msg.sender);
    }

    /**
     * @dev Optional override to change decimals. Default is 18.
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    /**
     * @dev Function to pause all token transfers.
     * Can only be called by accounts with admin role.
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Function to unpause token transfers.
     * Can only be called by accounts with admin role.
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Mint new tokens.
     * Can only be called by accounts with the MINTER_ROLE.
     * @param to The address to receive minted tokens.
     * @param amount The token amount to mint.
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /**
     * @dev Reward function to mint tokens based on game score.
     * @param recipient The address of the player receiving tokens.
     * @param score The player's score (or the number of bounces, etc.).
     */
    function reward(
        address recipient,
        uint256 score
    ) external onlyRole(MINTER_ROLE) {
        uint256 tokensToMint = score *
            SCORE_CONVERSION *
            (10 ** uint256(decimals()));
        _mint(recipient, tokensToMint);
    }

    /**
     * @dev Overrides the _beforeTokenTransfer hook from ERC20 to include whenNotPaused.
     * This ensures that no token transfers occur while the contract is paused.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
