from pyparsing import Enum


class Operator(str, Enum):
    ABOVE = "Above"
    BELOW = "Below"
    CROSSUP = "CrossUp"
    CROSSDOWN = "CrossDown"
    ABOVEOREQUAL = "AboveOrEqual"
    BELOWOREQUAL = "BelowOrEqual"
