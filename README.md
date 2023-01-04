# LotteryVRFv2
In order to generate a strong random `salt`, Python `secrets` library will be used as follow:

    import secrets
    secrets.randbelow(2**256 - 1)
