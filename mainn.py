from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
import time

def setup_driver():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    return webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

def vote_mithrill(driver, nickname):
    driver.get('https://czech-craft.eu/server/mithrill/vote/')
    nickname_field = driver.find_element('name', 'nickname')
    nickname_field.send_keys(nickname)
    vote_button = driver.find_element('xpath', '//input[@type="submit"]')
    vote_button.click()
    time.sleep(2)  # Wait for the page to load
    try:
        driver.find_element('class name', 'alert-success')
        print('Mithrill vote successful!')
    except:
        print('Mithrill vote failed!')

def vote_mcserver_list(driver, nickname):
    driver.get('https://mcserver-list.eu/en/vote/432')
    nickname_field = driver.find_element('name', 'minecraft_username')
    nickname_field.send_keys(nickname)
    vote_button = driver.find_element('xpath', '//input[@type="submit"]')
    vote_button.click()
    time.sleep(2)  # Wait for the page to load
    try:
        driver.find_element('class name', 'alert-success')
        print('MCServer List vote successful!')
    except:
        print('MCServer List vote failed!')

def auto_vote(nickname):
    driver = setup_driver()
    try:
        vote_mithrill(driver, nickname)
        vote_mcserver_list(driver, nickname)
    finally:
        driver.quit()

if __name__ == '__main__':
    auto_vote('Tlicarek')
