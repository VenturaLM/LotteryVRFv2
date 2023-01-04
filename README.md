# LotteryVRFv2
In order to generate a strong random `salt` in `computeWinner(uint256 salt)`, Python [secrets](https://docs.python.org/3/library/secrets.html) library will be used as follow:

    import secrets
    secrets.randbelow(2**256 - 1)

The [`secrets.randbelow(n)`](https://docs.python.org/3/library/secrets.html#secrets.randbelow) function returns a random int in the range [0, n).
