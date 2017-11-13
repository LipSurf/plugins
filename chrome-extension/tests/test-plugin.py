#!/usr/bin/env python3
'''
apt install python3-opencv
    # part of the screen
    im=ImageGrab.grab(bbox=(10,10,500,500))
    im.show()

ipdb
pyscreenshot
selenium
'''
import unittest
import logging
import os
import numpy as np
import cv2
import pyscreenshot as ImageGrab
import subprocess
from unittest import skip
from time import sleep
from subprocess import run
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

logging.basicConfig()
logger = logging.getLogger()
# not working
logger.setLevel(os.environ.get('LOG_LEVEL', logging.DEBUG))


ICON_ON = cv2.imread('/media/sf_no-hands-man/tests/icon-on.png', 0)
ICON_OFF = cv2.imread('/media/sf_no-hands-man/tests/icon-off.png', 0)


def move_mouse(x, y):
    logger.debug("Moving mouse %d %d" % (x, y))
    run(['xdotool', 'mousemove', str(x), str(y)])


def click_mouse(x, y):
    if x and y:
        move_mouse(x, y)
    logger.debug("Clicking mouse...")
    run(['xdotool', 'click', '1'])


def toggle_extension(active=True):
    # extension button
    click_mouse(898, 76)


# not working
def drag(x1, y1, x2, y2):
    move_mouse(x1, y1)
    sleep(0.5)
    run(['xdotool', 'mousedown', '1'])
    sleep(0.5)
    run(['xdotool', 'mousemove_relative', '--sync', '200', '200'])
    sleep(0.5)
    run(['xdotool',  'mouseup', '1'])


def press_keys(keys):
    logger.debug("Pressing keys %s" % keys)
    run(['xdotool', 'key', keys])


def type_keys(keys):
    logger.debug("Typing keys %s" % keys)
    run(['xdotool', 'type', keys])


class TalkableMixin(object):

    def say(self, phrase):
        logger.debug("Saying %s" % phrase)
        self.driver.execute_script("window.speechSynthesis.speak(new SpeechSynthesisUtterance('%s')); console.log('ya');" % phrase)


class ScreenCheckingMixin(object):

    @staticmethod
    def _check_screen(img):
        im = ImageGrab.grab()
        res = np.where(cv2.matchTemplate(img, np.array(im.convert('L'), np.uint8), cv2.TM_CCOEFF_NORMED) > 0.99)
        return res

    '''
    Check if an image exists on the screen
    '''
    def check_in_screen(self, img):
        self.assertTrue(len(self._check_screen(img)[0]) > 0, 'Image does not exist in screen when it should')


    def check_not_in_screen(self, img):
        self.assertTrue(len(self._check_screen(img)[0]) == 0, 'Image exists in screen when it shouldn\'t')


class SeleniumTest(unittest.TestCase):

    def setUp(self):
        chrome_options = Options()
        # unpacked_extension_path = '/media/sf_no-hands-man'
        # chrome_options.add_argument("--load-extension=%s" % unpacked_extension_path)
        # chrome_options.add_extension("/home/mikob/workspace/no-hands-man/no-hands-man.crx")
        chrome_options.add_extension("/media/sf_no-hands-man/no-hands-man.crx")
        self.driver = webdriver.Chrome(os.path.join(os.path.curdir, 'chromedriver'), chrome_options=chrome_options)
        self.driver.implicitly_wait(3) # seconds

    def tearDown(self):
        self.driver.close()


class TestAddOnInitialization(SeleniumTest, ScreenCheckingMixin):

    def just_open(self):
        driver.get("chrome://extensions")
        assert "Extensions" in driver.title

        press_keys("ctrl+t")

        driver.switch_to.window(driver.window_handles[1])
        # click enable developer mode
        sleep(0.5)
        click_mouse(636, 165)

        # click background page debugging
        sleep(0.5)
        click_mouse(253, 591)

        # sources tab
        sleep(0.5)
        click_mouse(300, 183)

        # expand "src"
        sleep(0.5)
        click_mouse(134, 290)

        press_keys('Super_R+Down')
        sleep(0.5)

        press_keys('Alt_L+Tab')
        sleep(0.5)

    # happy path
    def test_allow_addon(self):
        # we do thorough checking (just to make sure recognizing icons is working)
        self.check_in_screen(ICON_OFF)
        self.check_not_in_screen(ICON_ON)

        toggle_extension()

        # allow mic permission
        sleep(2)
        click_mouse(364, 208)

        sleep(2)
        self.check_in_screen(ICON_ON)
        self.check_not_in_screen(ICON_OFF)

    def test_block_addon(self):
        toggle_extension()

        # deny mic permission
        sleep(2)
        click_mouse(296, 208)

        sleep(4)
        self.check_in_screen(ICON_OFF)

    def test_block_then_allow(self):
        toggle_extension()

        # deny mic permission
        sleep(2)
        click_mouse(296, 208)

        sleep(4)
        self.check_in_screen(ICON_OFF)

        click_mouse(810, 71)
        sleep(0.3)
        click_mouse(606, 135)
        click_mouse(771, 261)

        sleep(1.5)
        self.check_in_screen(ICON_ON)

    def test_allow_then_block(self):
        pass
        # toggle_extension()

        # # deny mic permission
        # sleep(2)
        # click_mouse(296, 208)

        # sleep(4)
        # self.check_in_screen(ICON_OFF)

        # click_mouse(810, 71)
        # sleep(0.3)
        # click_mouse(606, 135)
        # click_mouse(771, 261)

        # sleep(1.5)
        # self.check_in_screen(ICON_ON)

'''
Tests that run after permission is granted
'''
class TestAfterInit(unittest.TestCase, ScreenCheckingMixin):
    @classmethod
    def setUpClass(cls):
        chrome_options = Options()
        # unpacked_extension_path = '/media/sf_no-hands-man'
        # chrome_options.add_argument("--load-extension=%s" % unpacked_extension_path)
        # chrome_options.add_extension("/home/mikob/workspace/no-hands-man/no-hands-man.crx")
        chrome_options.add_extension("/media/sf_no-hands-man/no-hands-man.crx")
        cls.driver = webdriver.Chrome(os.path.join(os.path.curdir, 'chromedriver'), chrome_options=chrome_options)
        cls.driver.implicitly_wait(5) # seconds

        toggle_extension()

        # allow mic permission
        sleep(1.1)
        click_mouse(364, 208)

        sleep(0.3)

        toggle_extension(active=False)

        # close tab
        press_keys('ctrl+w')

    @classmethod
    def tearDownClass(cls):
        cls.driver.close()

    def test_open_plugin_while_page_loading(self):
        try:
            self.driver.set_page_load_timeout(2)
            self.driver.get('https://www.reddit.com')
        except TimeoutException:
            pass

        toggle_extension()

        self.assert_extension_running()

        sleep(20)

    def test_open_plugin_when_opening_page(self):
        self.driver.get('https://www.hotelroomalerts.com')

        toggle_extension()

        sleep(1)
        self.driver.get('https://www.reddit.com')

        self.assert_extension_running()

    def test_open_new_tab_while_plugin_already_running(self):
        pass

    '''
    Change the url
    '''
    def test_change_page_to_enabled_while_plugin_already_running(self):
        pass

    def test_change_page_to_enabled_while_plugin_already_running(self):
        pass


    def assert_extension_running(self):
        try:
            element = WebDriverWait(self.driver, 12).until(
                EC.presence_of_element_located((By.ID, "nhm-preview-cmd-box"))
            )
        finally:
            self.assertTrue(self.driver.find_element_by_id('nhm-preview-cmd-box').is_displayed(), "Extension is not loaded on page")


@skip
class TestDefaultPlugins(SeleniumTest, TalkableMixin):
    @classmethod
    def setUpClass(cls):
        subprocess.Popen(["google-chrome", "https://www.google.com"])
        sleep(2)

        # press_keys('Alt_L+Tab')
        sleep(0.5)
        press_keys('F12')
        sleep(0.9)
        type_keys("window.speechSynthesis.speak(new SpeechSynthesisUtterance(\"bottom\"));")
        sleep(1)
        press_keys('Return')

    def setUp(self):
        super(TestAddOnDefaultPlugins, self).setUp()
        toggle_extension()

        # allow mic permission
        sleep(2)
        click_mouse(364, 208)

        # close window
        press_keys('ctrl+w')

    def test_basic_commands(self):
        self.driver.get("https://www.reddit.com")

        sleep(2)
        self.say('Down')
        sleep(2)
        self.say('Bottom')
        sleep(2)
        self.say('Top')

        sleep(300)


if __name__ == '__main__':
    logger.info("\n\n---Start")
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestAfterInit)
    unittest.TextTestRunner().run(suite)
    # unittest.main()