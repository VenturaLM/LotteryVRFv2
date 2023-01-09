# LotteryVRFv2
In order to generate a strong random `salt` in `computeWinner(string memory salt)`, Python [secrets](https://docs.python.org/3/library/secrets.html) library will be used as follow:

    import secrets
    secrets.token_hex(64)

The [`secrets.token_hex(n)`](https://docs.python.org/3/library/secrets.html#secrets.token_hex) method return a random text string, in hexadecimal. The string has *nbytes* random bytes, each byte converted to two hex digits. If *nbytes* is `None` or not supplied, a reasonable default is used.
