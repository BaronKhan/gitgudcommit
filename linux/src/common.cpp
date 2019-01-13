#include <cstdio>
#include <iostream>
#include <memory>
#include <stdexcept>
#include <array>

#include "common.hpp"

namespace GitGud
{

  // https://stackoverflow.com/a/478960/8919086
  std::string exec(const char* cmd)
  {
    std::array<char, 128> buffer;
    std::string result;
    std::unique_ptr<FILE, decltype(&pclose)> pipe(popen(cmd, "r"), pclose);
    if (!pipe)
    {
      throw std::runtime_error("popen() failed!");
    }
    while (fgets(buffer.data(), buffer.size(), pipe.get()) != nullptr)
    {
      result += buffer.data();
    }
    return result;
  }

}