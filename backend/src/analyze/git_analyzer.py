import aiohttp
import asyncio
import requests
import typing
import abc

GIT_URL = "https://github.com/NeuroBreaker/DecisionHub"




class Get():
    @staticmethod
    def get():
        with requests.get(GIT_URL) as response:
            print(response.text)
            


def main():
    Get.get()
