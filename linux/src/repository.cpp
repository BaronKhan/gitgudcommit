#include <iostream>

#include "repository.hpp"
#include "common.hpp"

namespace GitGud
{

  Repository::Repository(Task task)
  : m_task(task)
  {
    if (!gitInstalled())
      throw "git is not installed";
    if (!isRepository())
      throw "Not a git repository (or any of the parent directories): .git";
    
    initialiseTask();
    executeTask();
  }

  //////////////////////////////////////////////////////////////////////////////

  bool Repository::gitInstalled()
  {
    return exec("git").find("usage: git") != std::string::npos;
  }

  //////////////////////////////////////////////////////////////////////////////

  bool Repository::isRepository()
  {
    return system("[ -d .git ] || git rev-parse --git-dir > /dev/null 2>&1") == 0;
  }

  //////////////////////////////////////////////////////////////////////////////

  void Repository::initialiseTask()
  {
    switch (m_task)
    {
      case Task::TASK_LOG:
      {
        m_mgr.log_mgr.initialise();
        break;
      }
      case Task::TASK_TRAIN:
      {
        m_mgr.train_mgr.initialise();
        break;
      }
      default:
      {
        throw "Task not yet implemented";
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////////

  void Repository::executeTask()
  {
    switch (m_task)
    {
      case Task::TASK_LOG:
      {
        m_mgr.log_mgr.execute();
        break;
      }
      case Task::TASK_TRAIN:
      {
        m_mgr.train_mgr.execute();
        break;
      }
      default:
      {
        throw "Task not yet implemented";
      }
    }
  }

}